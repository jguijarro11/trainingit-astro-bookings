import { randomUUID } from "crypto";
import type { Booking, CreateBookingDto, BookingError } from "../types/booking.type.js";
import { SEATS_MIN } from "../types/booking.type.js";
import { BOOKABLE_STATUSES } from "../types/launch.type.js";
import { bookingsRepository } from "../repositories/bookings.repository.js";
import { launchesRepository } from "../repositories/launches.repository.js";
import { customersRepository } from "../repositories/customers.repository.js";

const buildBooking = (dto: CreateBookingDto, pricePerSeat: number): Booking => ({
  id: randomUUID(),
  launchId: dto.launchId,
  customerEmail: dto.customerEmail,
  seats: dto.seats,
  pricePerSeat,
  totalAmount: dto.seats * pricePerSeat,
  createdAt: new Date().toISOString(),
});

export const getBookingsByLaunch = (launchId: string): Booking[] =>
  bookingsRepository.findByLaunchId(launchId);

export const createBooking = (dto: CreateBookingDto): Booking | BookingError => {
  const launch = launchesRepository.findById(dto.launchId);
  if (!launch) {
    return { statusCode: 404, message: `Launch with id '${dto.launchId}' not found.` };
  }

  if (!BOOKABLE_STATUSES.includes(launch.status as (typeof BOOKABLE_STATUSES)[number])) {
    return { statusCode: 409, message: `Launch is not open for bookings (status: ${launch.status}).` };
  }

  if (!customersRepository.findByEmail(dto.customerEmail)) {
    return { statusCode: 404, message: `Customer with email '${dto.customerEmail}' not found.` };
  }

  if (!Number.isInteger(dto.seats) || dto.seats < SEATS_MIN) {
    return { statusCode: 400, message: `seats must be a positive integer (minimum ${SEATS_MIN}).` };
  }

  if (dto.seats > launch.availableSeats) {
    return { statusCode: 409, message: `Requested seats (${dto.seats}) exceed available seats (${launch.availableSeats}).` };
  }

  const booking = buildBooking(dto, launch.pricePerSeat);

  const persisted = bookingsRepository.create(booking);
  launchesRepository.decrementSeats(dto.launchId, dto.seats);

  return persisted;
};
