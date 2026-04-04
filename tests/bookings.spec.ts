import { test, expect, type APIRequestContext } from "@playwright/test";

const ROCKETS_PATH = "/rockets";
const LAUNCHES_PATH = "/launches";
const CUSTOMERS_PATH = "/customers";

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const randomId = () => globalThis.crypto.randomUUID();

const createRocket = async (request: APIRequestContext, capacity = 8) => {
  const rocketResponse = await request.post(ROCKETS_PATH, {
    data: { name: `Booking Rocket ${randomId()}`, range: "orbital", capacity },
  });
  expect(rocketResponse.status()).toBe(201);
  return rocketResponse.json();
};

const createLaunch = async (
  request: APIRequestContext,
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
  request: APIRequestContext,
  email = `booking.${Date.now()}.${randomId()}@example.com`,
) => {
  const customerResponse = await request.post(CUSTOMERS_PATH, {
    data: { email, name: "Booking User", phone: "+34-600-000-000" },
  });
  expect(customerResponse.status()).toBe(201);
  return customerResponse.json();
};

const postBooking = (
  request: APIRequestContext,
  launchId: string,
  customerEmail: string,
  seats: number,
) => request.post(`${LAUNCHES_PATH}/${launchId}/bookings`, { data: { customerEmail, seats } });

const getLaunch = async (request: APIRequestContext, launchId: string) => {
  const response = await request.get(`${LAUNCHES_PATH}/${launchId}`);
  expect(response.status()).toBe(200);
  return response.json();
};

const getLaunchBookings = async (request: APIRequestContext, launchId: string) => {
  const response = await request.get(`${LAUNCHES_PATH}/${launchId}/bookings`);
  expect(response.status()).toBe(200);
  return response.json();
};

const transitionLaunchStatus = async (
  request: APIRequestContext,
  launchId: string,
  status: string,
) => {
  const response = await request.patch(`${LAUNCHES_PATH}/${launchId}/status`, { data: { status } });
  expect(response.status()).toBe(200);
};

const transitionLaunchStatuses = async (
  request: APIRequestContext,
  launchId: string,
  statuses: readonly string[],
) => {
  for (const status of statuses) {
    await transitionLaunchStatus(request, launchId, status);
  }
};

const NON_BOOKABLE_STATUS_CASES = [
  ["suspended", ["suspended"]],
  ["successful", ["confirmed", "successful"]],
  ["cancelled", ["cancelled"]],
] as const;

test.describe("Bookings API", () => {
  test("EARS-01/02: POST /launches/:id/bookings creates booking with persisted fields", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id, 300000, 2);
    const customer = await createCustomer(request);

    const response = await postBooking(request, launch.id, customer.email, 3);

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

    const response = await postBooking(request, "00000000-0000-0000-0000-000000000000", customer.email, 1);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-04: POST /launches/:id/bookings with unknown customer returns 404", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);

    const response = await postBooking(request, launch.id, `unknown.${Date.now()}@example.com`, 1);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toContain("Customer");
  });

  test("EARS-05: POST /launches/:id/bookings with invalid seats returns 400", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);

    const response = await postBooking(request, launch.id, customer.email, 0);

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("seats");
  });

  test("EARS-06: POST /launches/:id/bookings above available seats returns 409", async ({ request }) => {
    const rocket = await createRocket(request, 4);
    const launch = await createLaunch(request, rocket.id, 250000, 1);
    const customer = await createCustomer(request);

    const response = await postBooking(request, launch.id, customer.email, 5);

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain("exceed");
  });

  test("EARS-07: successful booking decrements availableSeats exactly by booked seats", async ({ request }) => {
    const rocket = await createRocket(request, 8);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);

    const preLaunch = await getLaunch(request, launch.id);

    const bookingResponse = await postBooking(request, launch.id, customer.email, 2);
    expect(bookingResponse.status()).toBe(201);

    const postLaunch = await getLaunch(request, launch.id);

    expect(postLaunch.availableSeats).toBe(preLaunch.availableSeats - 2);
  });

  test("EARS-08: failed booking does not decrement availableSeats", async ({ request }) => {
    const rocket = await createRocket(request, 6);
    const launch = await createLaunch(request, rocket.id);

    const preLaunch = await getLaunch(request, launch.id);

    const failedBookingResponse = await postBooking(request, launch.id, `missing.${Date.now()}@example.com`, 2);
    expect(failedBookingResponse.status()).toBe(404);

    const postLaunch = await getLaunch(request, launch.id);

    expect(postLaunch.availableSeats).toBe(preLaunch.availableSeats);
  });

  test("EARS-09: GET /launches/:id/bookings returns launch bookings with HTTP 200", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customerA = await createCustomer(request, `a.${Date.now()}.${randomId()}@example.com`);
    const customerB = await createCustomer(request, `b.${Date.now()}.${randomId()}@example.com`);

    await postBooking(request, launch.id, customerA.email, 1);
    await postBooking(request, launch.id, customerB.email, 2);

    const body = await getLaunchBookings(request, launch.id);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body.every((booking: { launchId: string }) => booking.launchId === launch.id)).toBe(true);
  });

  test("EARS-01-status: booking on scheduled launch returns 201", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);

    const response = await postBooking(request, launch.id, customer.email, 1);

    expect(response.status()).toBe(201);
  });

  test("EARS-02-status: booking on confirmed launch returns 201", async ({ request }) => {
    const rocket = await createRocket(request);
    const launch = await createLaunch(request, rocket.id);
    const customer = await createCustomer(request);
    await transitionLaunchStatus(request, launch.id, "confirmed");

    const response = await postBooking(request, launch.id, customer.email, 1);

    expect(response.status()).toBe(201);
  });

  test("EARS-08-status: confirmed launch still rejects overbooking", async ({ request }) => {
    const rocket = await createRocket(request, 2);
    const launch = await createLaunch(request, rocket.id, 250000, 1);
    const customer = await createCustomer(request);
    await transitionLaunchStatus(request, launch.id, "confirmed");

    const response = await postBooking(request, launch.id, customer.email, 3);

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain("exceed");

    const updatedLaunch = await getLaunch(request, launch.id);
    expect(updatedLaunch.availableSeats).toBe(2);
  });

  for (const [status, transitions] of NON_BOOKABLE_STATUS_CASES) {
    test(`booking on ${status} launch returns 409 and preserves state`, async ({ request }) => {
      const rocket = await createRocket(request, 8);
      const launch = await createLaunch(request, rocket.id);
      const customer = await createCustomer(request);
      await transitionLaunchStatuses(request, launch.id, transitions);

      const preLaunch = await getLaunch(request, launch.id);

      const failedResponse = await postBooking(request, launch.id, customer.email, 2);
      expect(failedResponse.status()).toBe(409);

      const body = await failedResponse.json();
      expect(body.error).toContain(status);

      const postLaunch = await getLaunch(request, launch.id);
      expect(postLaunch.availableSeats).toBe(preLaunch.availableSeats);

      const bookings = await getLaunchBookings(request, launch.id);
      expect(bookings.length).toBe(0);
    });
  }
});
