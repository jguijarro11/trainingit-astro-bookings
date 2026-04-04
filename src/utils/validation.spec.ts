import { describe, expect, it } from "vitest";

import { validateRocketInput, ValidationError } from "./validation.js";

describe("validateRocketInput", () => {
  it("returns sanitized payload for valid data", () => {
    const result = validateRocketInput({
      name: " Falcon 9 ",
      range: "orbital",
      capacity: 10,
    });

    expect(result).toEqual({
      name: "Falcon 9",
      range: "orbital",
      capacity: 10,
    });
  });

  it("throws ValidationError when name is missing", () => {
    expect(() =>
      validateRocketInput({
        range: "orbital",
        capacity: 5,
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateRocketInput({
        range: "orbital",
        capacity: 5,
      }),
    ).toThrow("name is required.");
  });

  it("throws ValidationError when name is empty after trim", () => {
    expect(() =>
      validateRocketInput({
        name: "   ",
        range: "orbital",
        capacity: 5,
      }),
    ).toThrow("name is required.");
  });

  it("accepts allowed ranges", () => {
    const validRanges = ["suborbital", "orbital", "moon", "mars"] as const;

    for (const range of validRanges) {
      expect(() =>
        validateRocketInput({
          name: "Valid rocket",
          range,
          capacity: 5,
        }),
      ).not.toThrow();
    }
  });

  it("throws ValidationError for invalid range", () => {
    expect(() =>
      validateRocketInput({
        name: "Starship",
        range: "invalid",
        capacity: 5,
      }),
    ).toThrow("range must be one of: suborbital, orbital, moon, mars.");
  });

  it("validates capacity boundaries", () => {
    expect(() =>
      validateRocketInput({
        name: "Boundary min",
        range: "suborbital",
        capacity: 1,
      }),
    ).not.toThrow();

    expect(() =>
      validateRocketInput({
        name: "Boundary max",
        range: "mars",
        capacity: 10,
      }),
    ).not.toThrow();

    for (const invalidCapacity of [0, 11]) {
      expect(() =>
        validateRocketInput({
          name: "Invalid capacity",
          range: "orbital",
          capacity: invalidCapacity,
        }),
      ).toThrow("capacity must be an integer between 1 and 10.");
    }
  });
});
