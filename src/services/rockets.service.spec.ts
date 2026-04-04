import { describe, expect, it, vi } from "vitest";

import type { CreateRocketDto, Rocket } from "../types/rocket.type.js";

vi.mock("../repositories/rockets.repository.js", () => ({
  rocketsRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import {
  createRocket,
  deleteRocket,
  getRocketById,
  getRockets,
  updateRocket,
} from "./rockets.service.js";
import { rocketsRepository } from "../repositories/rockets.repository.js";

const mockedRepository = vi.mocked(rocketsRepository);

describe("rockets service", () => {
  it("createRocket returns conflict message when name already exists", () => {
    const dto: CreateRocketDto = { name: "Falcon 9", range: "orbital", capacity: 7 };

    mockedRepository.findByName.mockReturnValue({
      id: "existing-id",
      ...dto,
    });

    const result = createRocket(dto);

    expect(result).toBe("Rocket with name 'Falcon 9' already exists.");
    expect(mockedRepository.create).not.toHaveBeenCalled();
  });

  it("createRocket delegates creation to repository", () => {
    const dto: CreateRocketDto = { name: "Starship", range: "mars", capacity: 10 };
    const created: Rocket = { id: "rocket-id", ...dto };

    mockedRepository.findByName.mockReturnValue(undefined);
    mockedRepository.create.mockReturnValue(created);

    const result = createRocket(dto);

    expect(result).toEqual(created);
    expect(mockedRepository.create).toHaveBeenCalledWith(dto);
  });

  it("getRockets returns repository data", () => {
    const rockets: Rocket[] = [
      { id: "rocket-1", name: "Falcon 9", range: "orbital", capacity: 7 },
      { id: "rocket-2", name: "New Glenn", range: "moon", capacity: 8 },
    ];

    mockedRepository.findAll.mockReturnValue(rockets);

    expect(getRockets()).toEqual(rockets);
    expect(mockedRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("getRocketById returns undefined when repository has no match", () => {
    mockedRepository.findById.mockReturnValue(undefined);

    const result = getRocketById("missing-id");

    expect(result).toBeUndefined();
    expect(mockedRepository.findById).toHaveBeenCalledWith("missing-id");
  });

  it("updateRocket returns undefined for missing rocket", () => {
    mockedRepository.findById.mockReturnValue(undefined);

    const result = updateRocket("missing-id", { name: "Updated" });

    expect(result).toBeUndefined();
    expect(mockedRepository.update).not.toHaveBeenCalled();
  });

  it("deleteRocket delegates to repository", () => {
    mockedRepository.remove.mockReturnValue(true);

    const result = deleteRocket("rocket-id");

    expect(result).toBe(true);
    expect(mockedRepository.remove).toHaveBeenCalledWith("rocket-id");
  });
});
