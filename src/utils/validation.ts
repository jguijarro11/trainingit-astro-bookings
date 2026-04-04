import {
  ROCKET_CAPACITY_MAX,
  ROCKET_CAPACITY_MIN,
  ROCKET_RANGES,
  type CreateRocketDto,
  type RocketRange,
} from "../types/rocket.type.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

type JsonRecord = Record<string, unknown>;

const asJsonRecord = (value: unknown): JsonRecord =>
  (value as JsonRecord) ?? {};

const isValidRange = (range: unknown): range is RocketRange =>
  ROCKET_RANGES.includes(range as RocketRange);

const isValidCapacity = (capacity: unknown): capacity is number =>
  typeof capacity === "number" &&
  Number.isInteger(capacity) &&
  capacity >= ROCKET_CAPACITY_MIN &&
  capacity <= ROCKET_CAPACITY_MAX;

export const validateRocketInput = (body: unknown): CreateRocketDto => {
  const { name, range, capacity } = asJsonRecord(body);

  if (typeof name !== "string" || name.trim() === "") {
    throw new ValidationError("name is required.");
  }

  if (!isValidRange(range)) {
    throw new ValidationError(`range must be one of: ${ROCKET_RANGES.join(", ")}.`);
  }

  if (!isValidCapacity(capacity)) {
    throw new ValidationError(
      `capacity must be an integer between ${ROCKET_CAPACITY_MIN} and ${ROCKET_CAPACITY_MAX}.`,
    );
  }

  return {
    name: name.trim(),
    range,
    capacity,
  };
};
