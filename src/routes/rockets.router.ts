import { Router, type Request, type Response } from "express";
import {
  ROCKET_RANGES,
  ROCKET_CAPACITY_MIN,
  ROCKET_CAPACITY_MAX,
} from "../types/rocket.type.js";
import type { CreateRocketDto, UpdateRocketDto } from "../types/rocket.type.js";
import { rocketsRepository } from "../repositories/rockets.repository.js";

export const rocketsRouter = Router();

const isValidRange = (range: unknown): range is (typeof ROCKET_RANGES)[number] =>
  ROCKET_RANGES.includes(range as (typeof ROCKET_RANGES)[number]);

const isValidCapacity = (capacity: unknown): capacity is number =>
  typeof capacity === "number" &&
  capacity >= ROCKET_CAPACITY_MIN &&
  capacity <= ROCKET_CAPACITY_MAX;

const validateCreateDto = (body: unknown): CreateRocketDto | string => {
  const { name, range, capacity } = body as Record<string, unknown>;
  if (typeof name !== "string" || name.trim() === "") return "name is required.";
  if (!isValidRange(range))
    return `range must be one of: ${ROCKET_RANGES.join(", ")}.`;
  if (!isValidCapacity(capacity))
    return `capacity must be an integer between ${ROCKET_CAPACITY_MIN} and ${ROCKET_CAPACITY_MAX}.`;
  return { name: name.trim(), range, capacity };
};

const validateUpdateDto = (body: unknown): UpdateRocketDto | string => {
  const { name, range, capacity } = body as Record<string, unknown>;
  const dto: UpdateRocketDto = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") return "name must be a non-empty string.";
    dto.name = name.trim();
  }
  if (range !== undefined) {
    if (!isValidRange(range)) return `range must be one of: ${ROCKET_RANGES.join(", ")}.`;
    dto.range = range;
  }
  if (capacity !== undefined) {
    if (!isValidCapacity(capacity))
      return `capacity must be an integer between ${ROCKET_CAPACITY_MIN} and ${ROCKET_CAPACITY_MAX}.`;
    dto.capacity = capacity;
  }
  return dto;
};

// GET /rockets
rocketsRouter.get("/", (_req: Request, res: Response) => {
  res.json(rocketsRepository.findAll());
});

// GET /rockets/:id
rocketsRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const rocket = rocketsRepository.findById(id);
  if (!rocket) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }
  res.json(rocket);
});

// POST /rockets
rocketsRouter.post("/", (req: Request, res: Response) => {
  const result = validateCreateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  if (rocketsRepository.findByName(result.name)) {
    res.status(409).json({ error: `Rocket with name '${result.name}' already exists.` });
    return;
  }
  const rocket = rocketsRepository.create(result);
  res.status(201).json(rocket);
});

// PUT /rockets/:id
rocketsRouter.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const existing = rocketsRepository.findById(id);
  if (!existing) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }
  const result = validateUpdateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }
  const updated = rocketsRepository.update(id, result);
  res.json(updated);
});

// DELETE /rockets/:id
rocketsRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const removed = rocketsRepository.remove(id);
  if (!removed) {
    res.status(404).json({ error: `Rocket with id '${id}' not found.` });
    return;
  }
  res.status(204).send();
});
