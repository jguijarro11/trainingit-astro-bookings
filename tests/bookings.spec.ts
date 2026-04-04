import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const ROCKETS_PATH = "/rockets";
const LAUNCHES_PATH = "/launches";
const CUSTOMERS_PATH = "/customers";

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const createRocket = async (request: Parameters<typeof test>[0]["request"], capacity = 8) => {
  const rocketResponse = await request.post(ROCKETS_PATH, {
    data: { name: `Booking Rocket ${randomUUID()}`, range: "orbital", capacity },
  });
  expect(rocketResponse.status()).toBe(201);
  return rocketResponse.json();
};

const createLaunch = async (
  request: Parameters<typeof test>[0]["request"],
  rocketId: string,
  pricePerSeat = 250000,
  minimumPassengers = 2,
) => {
  const launchResponse = await request.post(LAUNCHES_PATH, {
    data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat, minimumPassengers },
  });
  expect(launchResponse.status()).toBe(201);
  return launchResponse.json();
};

const createCustomer = async (
  request: Parameters<typeof test>[0]["request"],
  email = `booking.${Date.now()}.${randomUUID()}@example.com`,
) => {
  const customerResponse = await request.post(CUSTOMERS_PATH, {
    data: { email, name: "Booking User", phone: "+34-600-000-000" },
  });
  expect(customerResponse.status()).toBe(201);
  return customerResponse.json();
};

test.describe("Bookings API", () => {
  test("EARS-01/02: POST /launches/:id/bookings creates booking with persisted fields", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id, 300000, 2);
    const customer = await createCustomer(request);

    const response = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customer.email, seats: 3 },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body.id).toBeDefined();
    expect(body.launchId).toBe(launch.id);
    expect(body.customerEmail).toBe(customer.email);
    expect(body.seats).toBe(3);
    expect(body.pricePerSeat).toBe(300000);
    expect(body.totalAmount).toBe(900000);
    expect(body.createdAt).toBeDefined();
  });

  test("EARS-03: POST /launches/:id/bookings with unknown launch returns 404", async ({ request }) => {
    const customer = await createCustomer(request);

    const response = await request.post(`${LAUNCHES_PATH}/00000000-0000-0000-0000-000000000000/bookings`, {
      data: { customerEmail: customer.email, seats: 1 },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-04: POST /launches/:id/bookings with unknown customer returns 404", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);

    const response = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: `unknown.${Date.now()}@example.com`, seats: 1 },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toContain("Customer");
  });

  test("EARS-05: POST /launches/:id/bookings with invalid seats returns 400", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);

    const response = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customer.email, seats: 0 },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("seats");
  });

  test("EARS-06: POST /launches/:id/bookings above available seats returns 409", async ({ request }) => {
    const rocket = await createRocket(request, 4);
    const launch = await createLaunch(request, rocket.id, 250000, 1);
    const customer = await createCustomer(request);

    const response = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customer.email, seats: 5 },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain("exceed");
  });

  test("EARS-07: successful booking decrements availableSeats exactly by booked seats", async ({ request }) => {
    const rocket = await createRocket(request, 8);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);

    const preLaunchResponse = await request.get(`${LAUNCHES_PATH}/${launch.id}`);
    const preLaunch = await preLaunchResponse.json();

    const bookingResponse = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customer.email, seats: 2 },
    });
    expect(bookingResponse.status()).toBe(201);

    const postLaunchResponse = await request.get(`${LAUNCHES_PATH}/${launch.id}`);
    const postLaunch = await postLaunchResponse.json();

    expect(postLaunch.availableSeats).toBe(preLaunch.availableSeats - 2);
  });

  test("EARS-08: failed booking does not decrement availableSeats", async ({ request }) => {
    const rocket = await createRocket(request, 6);
    const launch = await createLaunch(request, rocket.id);

    const preLaunchResponse = await request.get(`${LAUNCHES_PATH}/${launch.id}`);
    const preLaunch = await preLaunchResponse.json();

    const failedBookingResponse = await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: `missing.${Date.now()}@example.com`, seats: 2 },
    });
    expect(failedBookingResponse.status()).toBe(404);

    const postLaunchResponse = await request.get(`${LAUNCHES_PATH}/${launch.id}`);
    const postLaunch = await postLaunchResponse.json();

    expect(postLaunch.availableSeats).toBe(preLaunch.availableSeats);
  });

  test("EARS-09: GET /launches/:id/bookings returns launch bookings with HTTP 200", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customerA = await createCustomer(request, `a.${Date.now()}.${randomUUID()}@example.com`);
    const customerB = await createCustomer(request, `b.${Date.now()}.${randomUUID()}@example.com`);

    await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customerA.email, seats: 1 },
    });
    await request.post(`${LAUNCHES_PATH}/${launch.id}/bookings`, {
      data: { customerEmail: customerB.email, seats: 2 },
    });

    const response = await request.get(`${LAUNCHES_PATH}/${launch.id}/bookings`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body.every((booking: { launchId: string }) => booking.launchId === launch.id)).toBe(true);
  });
});
