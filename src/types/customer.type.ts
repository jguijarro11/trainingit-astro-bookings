export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Customer = {
  email: string;
  name: string;
  phone: string;
};

export type CreateCustomerDto = Customer;
