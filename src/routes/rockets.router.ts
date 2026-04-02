import { Router, type Request, type Response } from "express";
import {
  ROCKET_RANGES,
  ROCKET_CAPACITY_MIN,
  ROCKET_CAPACITY_MAX,
  type CreateRocketDto,
  type UpdateRocketDto,
} from "../types/rocket.type.js";
import * as rocketsService from "../services/rockets.service.js";

export const rocketsRouter = Router();

type JsonRecord = Record<string, unknown>;

const RANGE_ERROR_MESSAGE = `range must be one of: ${ROCKET_RANGES.join(", ")}.`;
const getCapacityErrorMessage = (): string =>
  `capacity must be an integer between ${ROCKET_CAPACITY_MIN} and ${ROCKET_CAPACITY_MAX}.`;

const asJsonRecord = (value: unknown): JsonRecord =>
  (value as JsonRecord) ?? {};

const isValidRange = (range: unknown): range is (typeof ROCKET_RANGES)[number] =>
  ROCKET_RANGES.includes(range as (typeof ROCKET_RANGES)[number]);

const isValidCapacity = (capacity: unknown): capacity is number =>
  typeof capacity === "number" &&
  Number.isInteger(capacity) &&
  capacity >= ROCKET_CAPACITY_MIN &&
  capacity <= ROCKET_CAPACITY_MAX;

const validateCreateDto = (body: unknown): CreateRocketDto | string => {
  const { name, range, capacity } = asJsonRecord(body);

  if (typeof name !== "string" || name.trim() === "") return "name is required.";

  if (!isValidRange(range)) return RANGE_ERROR_MESSAGE;
  if (!isValidCapacity(capacity)) return getCapacityErrorMessage();

  return { name: name.trim(), range, capacity };
};

const validateUpdateDto = (body: unknown): UpdateRocketDto | string => {
  const { name, range, capacity } = asJsonRecord(body);
  const dto: UpdateRocketDto = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") return "name must be a non-empty string.";
    dto.name = name.trim();
  }

  if (range !== undefined) {
    if (!isValidRange(range)) return RANGE_ERROR_MESSAGE;
    dto.range = range;
  }

  if (capacity !== undefined) {
    if (!isValidCapacity(capacity)) return getCapacityErrorMessage();
    dto.capacity = capacity;
  }

  return dto;
};

rocketsRouter.get("/", (_req: Request, res: Response) => {
  res.json(rocketsService.getRockets());
});

rocketsRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const rocket = rocketsService.getRocketById(id);
  if (!rocket) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }
  res.json(rocket);
});

rocketsRouter.post("/", (req: Request, res: Response) => {
  const result = validateCreateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  const rocket = rocketsService.createRocket(result);
  if (typeof rocket === "string") {
    res.status(409).json({ error: rocket });
    return;
  }
  res.status(201).json(rocket);
});

rocketsRouter.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const result = validateUpdateDto(req.body);

  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }

  const updated = rocketsService.updateRocket(id, result);

  if (updated === undefined) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }

  if (typeof updated === "string") {
    res.status(500).json({ error: updated });
    return;
  }

  res.json(updated);
});

rocketsRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const removed = rocketsService.deleteRocket(id);
  if (!removed) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }
  res.status(204).send();
});
