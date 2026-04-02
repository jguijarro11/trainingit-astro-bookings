import type { Launch, CreateLaunchDto, UpdateLaunchDto, LaunchStatus, LaunchError } from "../types/launch.type.js";
import { LAUNCH_STATUS_TRANSITIONS } from "../types/launch.type.js";
import { launchesRepository } from "../repositories/launches.repository.js";
import { rocketsRepository } from "../repositories/rockets.repository.js";

export const getLaunches = (): Launch[] => launchesRepository.findAll();

export const getLaunchById = (id: string): Launch | undefined =>
  launchesRepository.findById(id);

export const createLaunch = (dto: CreateLaunchDto): Launch | LaunchError => {
  const rocket = rocketsRepository.findById(dto.rocketId);
  if (!rocket) {
    return { statusCode: 404, message: `Rocket with id '${dto.rocketId}' not found.` };
  }

  const { capacity: totalSeats } = rocket;

  if (dto.minimumPassengers < 1 || dto.minimumPassengers > totalSeats) {
    return { statusCode: 400, message: `minimumPassengers must be an integer between 1 and ${totalSeats}.` };
  }

  return launchesRepository.create({ ...dto, totalSeats });
};

export const updateLaunch = (id: string, dto: UpdateLaunchDto): Launch | LaunchError | undefined => {
  const existing = launchesRepository.findById(id);
  if (!existing) return undefined;

  if (existing.status !== "scheduled") {
    return { statusCode: 409, message: `Launch can only be updated when status is 'scheduled'. Current status: '${existing.status}'.` };
  }

  const totalSeats = existing.totalSeats;
  const nextMinimumPassengers = dto.minimumPassengers ?? existing.minimumPassengers;

  if (nextMinimumPassengers < 1 || nextMinimumPassengers > totalSeats) {
    return { statusCode: 400, message: `minimumPassengers must be an integer between 1 and ${totalSeats}.` };
  }

  const updated = launchesRepository.update(id, dto);
  if (!updated) return { statusCode: 409, message: "Launch update failed due to inconsistent state." };

  return updated;
};

export const updateLaunchStatus = (id: string, newStatus: LaunchStatus): Launch | LaunchError | undefined => {
  const existing = launchesRepository.findById(id);
  if (!existing) return undefined;

  const allowedTransitions = LAUNCH_STATUS_TRANSITIONS[existing.status];
  if (!allowedTransitions.includes(newStatus)) {
    return { statusCode: 409, message: `Cannot transition launch from '${existing.status}' to '${newStatus}'.` };
  }

  const updated = launchesRepository.updateStatus(id, newStatus);
  if (!updated) return { statusCode: 409, message: "Launch status update failed due to inconsistent state." };

  return updated;
};
