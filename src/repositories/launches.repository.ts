import { randomUUID } from "crypto";
import type { Launch, CreateLaunchDto, UpdateLaunchDto } from "../types/launch.type.js";

const launches: Launch[] = [];

const getLaunchIndexById = (id: string): number =>
  launches.findIndex((launch) => launch.id === id);

const findAll = (): Launch[] => [...launches];

const findById = (id: string): Launch | undefined =>
  launches.find((l) => l.id === id);

const create = (dto: CreateLaunchDto & { totalSeats: number }): Launch => {
  const launch: Launch = {
    id: randomUUID(),
    ...dto,
    availableSeats: dto.totalSeats,
    status: "scheduled",
  };
  launches.push(launch);
  return launch;
};

const update = (id: string, dto: UpdateLaunchDto): Launch | undefined => {
  const index = getLaunchIndexById(id);
  if (index === -1) return undefined;

  const existing = launches[index] as Launch;
  const updated: Launch = { ...existing, ...dto };
  launches[index] = updated;

  return updated;
};

const updateStatus = (id: string, status: Launch["status"]): Launch | undefined => {
  const index = getLaunchIndexById(id);
  if (index === -1) return undefined;

  const existing = launches[index] as Launch;
  const updated: Launch = { ...existing, status };
  launches[index] = updated;

  return updated;
};

export const launchesRepository = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
};
