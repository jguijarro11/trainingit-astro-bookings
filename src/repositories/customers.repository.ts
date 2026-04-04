import type { Customer, CreateCustomerDto } from "../types/customer.type.js";

const customers: Customer[] = [];

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const findAll = (): Customer[] => [...customers];

const findByEmail = (email: string): Customer | undefined =>
  customers.find((c) => c.email === normalizeEmail(email));

const create = (dto: CreateCustomerDto): Customer => {
  const customer: Customer = { ...dto, email: normalizeEmail(dto.email) };
  customers.push(customer);
  return customer;
};

export const customersRepository = {
  findAll,
  findByEmail,
  create,
};
