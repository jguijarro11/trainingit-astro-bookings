const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const CONFIGURED_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";

const configuredLevelIndex = (): number => LOG_LEVELS.indexOf(CONFIGURED_LEVEL);

const shouldLog = (level: LogLevel): boolean =>
  LOG_LEVELS.indexOf(level) <= configuredLevelIndex();

const formatMessage = (level: LogLevel, message: string, context?: unknown): string => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (context === undefined) return base;
  return `${base} ${JSON.stringify(context)}`;
};

const log = (level: LogLevel, message: string, context?: unknown): void => {
  if (!shouldLog(level)) return;
  console.log(formatMessage(level, message, context));
};

export const info = (message: string, context?: unknown): void => log("info", message, context);
export const warn = (message: string, context?: unknown): void => log("warn", message, context);
export const error = (message: string, context?: unknown): void => log("error", message, context);
export const debug = (message: string, context?: unknown): void => log("debug", message, context);
