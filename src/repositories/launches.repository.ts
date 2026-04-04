import { randomUUID } from "crypto";
import type { Launch, CreateLaunchDto, UpdateLaunchDto } from "../types/launch.type.js";

const launches: Launch[] = [];

const getLaunchIndexById = (id: string): number =>
  launches.findIndex((launch) => launch.id === id);

const replaceLaunchAtIndex = (
  index: number,
  buildNext: (existing: Launch) => Launch,
): Launch | undefined => {
  if (index === -1) return undefined;

  const existing = launches[index] as Launch;
  const updated = buildNext(existing);
  launches[index] = updated;

  return updated;
};

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
  return replaceLaunchAtIndex(index, (existing) => ({ ...existing, ...dto }));
};

const updateStatus = (id: string, status: Launch["status"]): Launch | undefined => {
  const index = getLaunchIndexById(id);
  return replaceLaunchAtIndex(index, (existing) => ({ ...existing, status }));
};

const decrementSeats = (id: string, seats: number): Launch | undefined => {
  const index = getLaunchIndexById(id);
  const existing = index !== -1 ? (launches[index] as Launch) : undefined;
  if (!existing || existing.availableSeats - seats < 0) return undefined;

  return replaceLaunchAtIndex(index, (launch) => ({
    ...launch,
    availableSeats: launch.availableSeats - seats,
  }));
};

export const launchesRepository = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  decrementSeats,
};
