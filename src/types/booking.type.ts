export const SEATS_MIN = 1;

export type Booking = {
  id: string;
  launchId: string;
  customerEmail: string;
  seats: number;
  pricePerSeat: number;
  totalAmount: number;
  createdAt: string;
};

export type CreateBookingDto = {
  launchId: string;
  customerEmail: string;
  seats: number;
};

export type BookingError = {
  statusCode: number;
  message: string;
};
