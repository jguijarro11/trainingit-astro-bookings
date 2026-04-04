import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking, CreateBookingDto } from "../types/booking.type.js";
import type { Launch } from "../types/launch.type.js";
import type { Customer } from "../types/customer.type.js";

vi.mock("../repositories/launches.repository.js", () => ({
  launchesRepository: {
    findById: vi.fn(),
    decrementSeats: vi.fn(),
  },
}));

vi.mock("../repositories/customers.repository.js", () => ({
  customersRepository: {
    findByEmail: vi.fn(),
  },
}));

vi.mock("../repositories/bookings.repository.js", () => ({
  bookingsRepository: {
    findByLaunchId: vi.fn(),
    create: vi.fn(),
  },
}));

import { createBooking, getBookingsByLaunch } from "./bookings.service.js";
import { launchesRepository } from "../repositories/launches.repository.js";
import { customersRepository } from "../repositories/customers.repository.js";
import { bookingsRepository } from "../repositories/bookings.repository.js";

const mockedLaunches = vi.mocked(launchesRepository);
const mockedCustomers = vi.mocked(customersRepository);
const mockedBookings = vi.mocked(bookingsRepository);

const LAUNCH: Launch = {
  id: "launch-1",
  rocketId: "rocket-1",
  scheduledAt: "2030-01-01T00:00:00.000Z",
  pricePerSeat: 100000,
  minimumPassengers: 2,
  totalSeats: 8,
  availableSeats: 8,
  status: "scheduled",
};

const CONFIRMED_LAUNCH: Launch = { ...LAUNCH, status: "confirmed" };
const SUSPENDED_LAUNCH: Launch = { ...LAUNCH, status: "suspended" };
const SUCCESSFUL_LAUNCH: Launch = { ...LAUNCH, status: "successful" };
const CANCELLED_LAUNCH: Launch = { ...LAUNCH, status: "cancelled" };

const CUSTOMER: Customer = {
  email: "jane@example.com",
  name: "Jane Doe",
  phone: "123456789",
};

describe("bookings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBooking", () => {
    it("returns a fully populated booking on happy path", () => {
      const dto: CreateBookingDto = { launchId: "launch-1", customerEmail: "jane@example.com", seats: 3 };
      const expectedBooking: Booking = {
        id: expect.any(String) as string,
        launchId: "launch-1",
        customerEmail: "jane@example.com",
        seats: 3,
        pricePerSeat: 100000,
        totalAmount: 300000,
        createdAt: expect.any(String) as string,
      };

      mockedLaunches.findById.mockReturnValue(LAUNCH);
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);
      mockedBookings.create.mockImplementation((b) => b);

      const result = createBooking(dto);

      expect(result).toMatchObject(expectedBooking);
      expect(mockedBookings.create).toHaveBeenCalledOnce();
      expect(mockedLaunches.decrementSeats).toHaveBeenCalledWith("launch-1", 3);
    });

    it("returns 404 when launch does not exist", () => {
      mockedLaunches.findById.mockReturnValue(undefined);

      const result = createBooking({ launchId: "missing", customerEmail: "jane@example.com", seats: 1 });

      expect(result).toEqual({ statusCode: 404, message: expect.stringContaining("missing") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
    });

    it("returns 404 when customer is not registered", () => {
      mockedLaunches.findById.mockReturnValue(LAUNCH);
      mockedCustomers.findByEmail.mockReturnValue(undefined);

      const result = createBooking({ launchId: "launch-1", customerEmail: "ghost@example.com", seats: 1 });

      expect(result).toEqual({ statusCode: 404, message: expect.stringContaining("ghost@example.com") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
    });

    it("returns 400 when seats is not a positive integer", () => {
      mockedLaunches.findById.mockReturnValue(LAUNCH);
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 0 });

      expect(result).toEqual({ statusCode: 400, message: expect.any(String) });
      expect(mockedBookings.create).not.toHaveBeenCalled();
    });

    it("returns 409 when seats exceed availableSeats", () => {
      const tightLaunch: Launch = { ...LAUNCH, availableSeats: 2 };
      mockedLaunches.findById.mockReturnValue(tightLaunch);
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 5 });

      expect(result).toEqual({ statusCode: 409, message: expect.stringContaining("5") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
    });

    it("calls decrementSeats only after booking persistence", () => {
      const callOrder: string[] = [];
      mockedLaunches.findById.mockReturnValue(LAUNCH);
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);
      mockedBookings.create.mockImplementation((b) => { callOrder.push("create"); return b; });
      mockedLaunches.decrementSeats.mockImplementation(() => { callOrder.push("decrement"); return LAUNCH; });

      createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(callOrder).toEqual(["create", "decrement"]);
    });

    it("returns a booking for confirmed launch (EARS-02)", () => {
      mockedLaunches.findById.mockReturnValue(CONFIRMED_LAUNCH);
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);
      mockedBookings.create.mockImplementation((b) => b);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(result).toMatchObject({ launchId: "launch-1", seats: 2 });
      expect(mockedBookings.create).toHaveBeenCalledOnce();
      expect(mockedLaunches.decrementSeats).toHaveBeenCalledOnce();
    });

    it("returns 409 for suspended launch without persisting (EARS-03)", () => {
      mockedLaunches.findById.mockReturnValue(SUSPENDED_LAUNCH);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(result).toEqual({ statusCode: 409, message: expect.stringContaining("suspended") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
      expect(mockedLaunches.decrementSeats).not.toHaveBeenCalled();
    });

    it("returns 409 for successful launch without persisting (EARS-04)", () => {
      mockedLaunches.findById.mockReturnValue(SUCCESSFUL_LAUNCH);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(result).toEqual({ statusCode: 409, message: expect.stringContaining("successful") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
      expect(mockedLaunches.decrementSeats).not.toHaveBeenCalled();
    });

    it("returns 409 for cancelled launch without persisting (EARS-05)", () => {
      mockedLaunches.findById.mockReturnValue(CANCELLED_LAUNCH);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(result).toEqual({ statusCode: 409, message: expect.stringContaining("cancelled") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
      expect(mockedLaunches.decrementSeats).not.toHaveBeenCalled();
    });

    it("preserves overbooking protection for confirmed launch (EARS-08)", () => {
      mockedLaunches.findById.mockReturnValue({ ...CONFIRMED_LAUNCH, availableSeats: 1 });
      mockedCustomers.findByEmail.mockReturnValue(CUSTOMER);

      const result = createBooking({ launchId: "launch-1", customerEmail: "jane@example.com", seats: 2 });

      expect(result).toEqual({ statusCode: 409, message: expect.stringContaining("exceed") });
      expect(mockedBookings.create).not.toHaveBeenCalled();
      expect(mockedLaunches.decrementSeats).not.toHaveBeenCalled();
    });
  });

  describe("getBookingsByLaunch", () => {
    it("delegates to repository and returns bookings for the launch", () => {
      const booking: Booking = {
        id: "b1", launchId: "launch-1", customerEmail: "jane@example.com",
        seats: 2, pricePerSeat: 100000, totalAmount: 200000, createdAt: "2030-01-01T00:00:00.000Z",
      };
      mockedBookings.findByLaunchId.mockReturnValue([booking]);

      const result = getBookingsByLaunch("launch-1");

      expect(result).toEqual([booking]);
      expect(mockedBookings.findByLaunchId).toHaveBeenCalledWith("launch-1");
    });
  });
});
