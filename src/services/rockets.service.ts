import type { Rocket, CreateRocketDto, UpdateRocketDto } from "../types/rocket.type.js";
import { rocketsRepository } from "../repositories/rockets.repository.js";

export const getRockets = (): Rocket[] => {
  return rocketsRepository.findAll();
};

export const getRocketById = (id: string): Rocket | undefined => {
  return rocketsRepository.findById(id);
};

export const createRocket = (dto: CreateRocketDto): Rocket | string => {
  if (rocketsRepository.findByName(dto.name)) {
    return `Rocket with name '${dto.name}' already exists.`;
  }
  return rocketsRepository.create(dto);
};

export const updateRocket = (id: string, dto: UpdateRocketDto): Rocket | undefined | string => {
  const existing = rocketsRepository.findById(id);
  if (!existing) {
    return undefined;
  }
  
  const updated = rocketsRepository.update(id, dto);
  if (!updated) {
    return "Rocket update failed due to inconsistent state.";
  }
  
  return updated;
};

export const deleteRocket = (id: string): boolean => {
  return rocketsRepository.remove(id);
};
