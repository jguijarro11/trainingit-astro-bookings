export type JsonRecord = Record<string, unknown>;

export const asJsonRecord = (value: unknown): JsonRecord =>
  (value as JsonRecord) ?? {};
