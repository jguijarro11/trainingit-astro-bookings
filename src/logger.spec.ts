import { afterEach, describe, expect, it, vi } from "vitest";

const originalLogLevel = process.env.LOG_LEVEL;

const loadLogger = async (logLevel?: string) => {
  if (logLevel === undefined) {
    delete process.env.LOG_LEVEL;
  } else {
    process.env.LOG_LEVEL = logLevel;
  }

  vi.resetModules();
  return import("./logger.js");
};

afterEach(() => {
  if (originalLogLevel === undefined) {
    delete process.env.LOG_LEVEL;
  } else {
    process.env.LOG_LEVEL = originalLogLevel;
  }
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("logger", () => {
  it("logs info messages by default", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const logger = await loadLogger();

    logger.info("service started", { module: "server" });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0]?.[0]).toContain("[INFO] service started");
    expect(logSpy.mock.calls[0]?.[0]).toContain('"module":"server"');
  });

  it("does not log debug messages when LOG_LEVEL is info", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const logger = await loadLogger("info");

    logger.debug("hidden debug");

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("logs debug messages when LOG_LEVEL is debug", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const logger = await loadLogger("debug");

    logger.debug("visible debug");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0]?.[0]).toContain("[DEBUG] visible debug");
  });
});
