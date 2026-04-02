import { test, expect } from "@playwright/test";

const HEALTH_PATH = "/health";

test("smoke: health endpoint returns ok status", async ({ request }) => {
  const response = await request.get(HEALTH_PATH);

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.status).toBe("ok");
  expect(body.timestamp).toBeDefined();
});
