export const ROCKET_RANGES = ["suborbital", "orbital", "moon", "mars"] as const;
export type RocketRange = (typeof ROCKET_RANGES)[number];

export const ROCKET_CAPACITY_MIN = 1;
export const ROCKET_CAPACITY_MAX = 10;

export type Rocket = {
  id: string;
  name: string;
  range: RocketRange;
  capacity: number;
};

export type CreateRocketDto = Omit<Rocket, "id">;
export type UpdateRocketDto = Partial<CreateRocketDto>;
