export const LAUNCH_STATUSES = [
  "scheduled",
  "confirmed",
  "suspended",
  "successful",
  "cancelled",
] as const;

export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];

export const LAUNCH_STATUS_TRANSITIONS: Record<LaunchStatus, readonly LaunchStatus[]> = {
  scheduled: ["confirmed", "suspended", "cancelled"],
  confirmed: ["successful", "suspended", "cancelled"],
  suspended: ["scheduled", "cancelled"],
  successful: [],
  cancelled: [],
} as const;

export const BOOKABLE_STATUSES = ["scheduled", "confirmed"] as const satisfies readonly LaunchStatus[];
export type BookableStatus = (typeof BOOKABLE_STATUSES)[number];
export const isBookableLaunchStatus = (status: LaunchStatus): status is BookableStatus =>
  BOOKABLE_STATUSES.includes(status as BookableStatus);

export const PRICE_PER_SEAT_MIN = 1;
export const MINIMUM_PASSENGERS_MIN = 1;

export type Launch = {
  id: string;
  rocketId: string;
  scheduledAt: string;
  pricePerSeat: number;
  minimumPassengers: number;
  totalSeats: number;
  availableSeats: number;
  status: LaunchStatus;
};

export type CreateLaunchDto = {
  rocketId: string;
  scheduledAt: string;
  pricePerSeat: number;
  minimumPassengers: number;
};

export type UpdateLaunchDto = Partial<{
  scheduledAt: string;
  pricePerSeat: number;
  minimumPassengers: number;
}>;

export type UpdateLaunchStatusDto = {
  status: LaunchStatus;
};

export type LaunchError = {
  statusCode: 400 | 404 | 409;
  message: string;
};
