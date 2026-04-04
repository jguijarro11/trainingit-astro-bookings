import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateCustomerDto, Customer } from "../types/customer.type.js";

vi.mock("../repositories/customers.repository.js", () => ({
  customersRepository: {
    findAll: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}));

import {
  createCustomer,
  getCustomerByEmail,
  getCustomers,
} from "./customers.service.js";
import { customersRepository } from "../repositories/customers.repository.js";

const mockedRepository = vi.mocked(customersRepository);

describe("customers service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("createCustomer returns a customer on happy path", () => {
    const dto: CreateCustomerDto = { email: "alice@example.com", name: "Alice", phone: "123456789" };
    const created: Customer = { ...dto };

    mockedRepository.findByEmail.mockReturnValue(undefined);
    mockedRepository.create.mockReturnValue(created);

    const result = createCustomer(dto);

    expect(result).toEqual(created);
    expect(mockedRepository.create).toHaveBeenCalledWith(dto);
  });

  it("createCustomer returns error string when email already registered", () => {
    const dto: CreateCustomerDto = { email: "alice@example.com", name: "Alice", phone: "123456789" };

    mockedRepository.findByEmail.mockReturnValue({ ...dto });

    const result = createCustomer(dto);

    expect(typeof result).toBe("string");
    expect(mockedRepository.create).not.toHaveBeenCalled();
  });

  it("createCustomer treats emails differing only by case as duplicates", () => {
    const dto: CreateCustomerDto = { email: "ALICE@EXAMPLE.COM", name: "Alice", phone: "123456789" };

    mockedRepository.findByEmail.mockReturnValue({ ...dto, email: "alice@example.com" });

    const result = createCustomer(dto);

    expect(typeof result).toBe("string");
    expect(mockedRepository.create).not.toHaveBeenCalled();
  });

  it("getCustomerByEmail returns undefined for unknown email", () => {
    mockedRepository.findByEmail.mockReturnValue(undefined);

    const result = getCustomerByEmail("unknown@example.com");

    expect(result).toBeUndefined();
  });

  it("getCustomers delegates to repository", () => {
    const customers: Customer[] = [
      { email: "alice@example.com", name: "Alice", phone: "111" },
    ];
    mockedRepository.findAll.mockReturnValue(customers);

    const result = getCustomers();

    expect(result).toEqual(customers);
  });
});
