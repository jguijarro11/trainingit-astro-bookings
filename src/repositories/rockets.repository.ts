import { randomUUID } from "crypto";
import type { Rocket, CreateRocketDto, UpdateRocketDto } from "../types/rocket.type.js";

const rockets: Rocket[] = [];

const findAll = (): Rocket[] => [...rockets];

const findById = (id: string): Rocket | undefined =>
  rockets.find((r) => r.id === id);

const findByName = (name: string): Rocket | undefined =>
  rockets.find((r) => r.name === name);

const create = (dto: CreateRocketDto): Rocket => {
  const rocket: Rocket = { id: randomUUID(), ...dto };
  rockets.push(rocket);
  return rocket;
};

const update = (id: string, dto: UpdateRocketDto): Rocket | undefined => {
  const index = rockets.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const existing = rockets[index] as Rocket;
  const updated: Rocket = { ...existing, ...dto, id: existing.id };
  rockets[index] = updated;
  return updated;
};

const remove = (id: string): boolean => {
  const index = rockets.findIndex((r) => r.id === id);
  if (index === -1) return false;
  rockets.splice(index, 1);
  return true;
};

export const rocketsRepository = { findAll, findById, findByName, create, update, remove };
