import type { Booking } from "../types/booking.type.js";

const bookings: Booking[] = [];

const findByLaunchId = (launchId: string): Booking[] =>
  bookings.filter((b) => b.launchId === launchId);

const create = (booking: Booking): Booking => {
  bookings.push(booking);
  return booking;
};

export const bookingsRepository = {
  findByLaunchId,
  create,
};
