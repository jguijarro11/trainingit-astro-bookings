import type { Customer, CreateCustomerDto } from "../types/customer.type.js";
import { customersRepository } from "../repositories/customers.repository.js";

export const getCustomers = (): Customer[] => {
  return customersRepository.findAll();
};

export const getCustomerByEmail = (email: string): Customer | undefined => {
  return customersRepository.findByEmail(email);
};

export const createCustomer = (dto: CreateCustomerDto): Customer | string => {
  if (customersRepository.findByEmail(dto.email)) {
    return `Customer with email '${dto.email}' already exists.`;
  }
  return customersRepository.create(dto);
};
