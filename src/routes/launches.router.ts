import { Router, type Request, type Response } from "express";
import {
  LAUNCH_STATUSES,
  PRICE_PER_SEAT_MIN,
  MINIMUM_PASSENGERS_MIN,
  type CreateLaunchDto,
  type UpdateLaunchDto,
  type UpdateLaunchStatusDto,
  type LaunchStatus,
  type LaunchError,
} from "../types/launch.type.js";

const isLaunchError = (value: unknown): value is LaunchError =>
  typeof value === "object" && value !== null && "statusCode" in value && "message" in value;
import * as launchesService from "../services/launches.service.js";

export const launchesRouter = Router();

type JsonRecord = Record<string, unknown>;

const asJsonRecord = (value: unknown): JsonRecord => (value as JsonRecord) ?? {};

const isValidIsoFutureDate = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date > new Date();
};

const isValidPricePerSeat = (value: unknown): value is number =>
  typeof value === "number" && value >= PRICE_PER_SEAT_MIN;

const isValidMinimumPassengers = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= MINIMUM_PASSENGERS_MIN;

const isValidStatus = (value: unknown): value is LaunchStatus =>
  LAUNCH_STATUSES.includes(value as LaunchStatus);

const validateCreateDto = (body: unknown): CreateLaunchDto | string => {
  const { rocketId, scheduledAt, pricePerSeat, minimumPassengers } = asJsonRecord(body);

  if (typeof rocketId !== "string" || rocketId.trim() === "") return "rocketId is required.";
  if (!isValidIsoFutureDate(scheduledAt))
    return "scheduledAt must be a valid future ISO-8601 timestamp.";
  if (!isValidPricePerSeat(pricePerSeat))
    return `pricePerSeat must be a positive number (minimum ${PRICE_PER_SEAT_MIN}).`;
  if (!isValidMinimumPassengers(minimumPassengers))
    return `minimumPassengers must be a positive integer (minimum ${MINIMUM_PASSENGERS_MIN}).`;

  return {
    rocketId: rocketId.trim(),
    scheduledAt: scheduledAt as string,
    pricePerSeat: pricePerSeat as number,
    minimumPassengers: minimumPassengers as number,
  };
};

const validateUpdateDto = (body: unknown): UpdateLaunchDto | string => {
  const { scheduledAt, pricePerSeat, minimumPassengers } = asJsonRecord(body);
  const dto: UpdateLaunchDto = {};

  if (scheduledAt !== undefined) {
    if (!isValidIsoFutureDate(scheduledAt))
      return "scheduledAt must be a valid future ISO-8601 timestamp.";
    dto.scheduledAt = scheduledAt;
  }

  if (pricePerSeat !== undefined) {
    if (!isValidPricePerSeat(pricePerSeat))
      return `pricePerSeat must be a positive number (minimum ${PRICE_PER_SEAT_MIN}).`;
    dto.pricePerSeat = pricePerSeat as number;
  }

  if (minimumPassengers !== undefined) {
    if (!isValidMinimumPassengers(minimumPassengers))
      return `minimumPassengers must be a positive integer (minimum ${MINIMUM_PASSENGERS_MIN}).`;
    dto.minimumPassengers = minimumPassengers as number;
  }

  return dto;
};

const validateStatusDto = (body: unknown): UpdateLaunchStatusDto | string => {
  const { status } = asJsonRecord(body);

  if (!isValidStatus(status))
    return `status must be one of: ${LAUNCH_STATUSES.join(", ")}.`;

  return { status };
};

launchesRouter.get("/", (_req: Request, res: Response) => {
  res.json(launchesService.getLaunches());
});

launchesRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const launch = launchesService.getLaunchById(id);
  if (!launch) {
    res.status(404).json({ error: `Launch with id '${id}' not found.` });
    return;
  }
  res.json(launch);
});

launchesRouter.post("/", (req: Request, res: Response) => {
  const result = validateCreateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  const launch = launchesService.createLaunch(result);
  if (isLaunchError(launch)) {
    res.status(launch.statusCode).json({ error: launch.message });
    return;
  }
  res.status(201).json(launch);
});

launchesRouter.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const result = validateUpdateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  const updated = launchesService.updateLaunch(id, result);
  if (updated === undefined) {
    res.status(404).json({ error: `Launch with id '${id}' not found.` });
    return;
  }
  if (isLaunchError(updated)) {
    res.status(updated.statusCode).json({ error: updated.message });
    return;
  }
  res.json(updated);
});

launchesRouter.patch("/:id/status", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const result = validateStatusDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  const updated = launchesService.updateLaunchStatus(id, result.status);
  if (updated === undefined) {
    res.status(404).json({ error: `Launch with id '${id}' not found.` });
    return;
  }
  if (isLaunchError(updated)) {
    res.status(updated.statusCode).json({ error: updated.message });
    return;
  }
  res.json(updated);
});
