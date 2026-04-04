import { Router, type Request, type Response } from "express";
import { EMAIL_REGEX, type CreateCustomerDto } from "../types/customer.type.js";
import * as customersService from "../services/customers.service.js";

export const customersRouter = Router();

type JsonRecord = Record<string, unknown>;

const asJsonRecord = (value: unknown): JsonRecord =>
  (value as JsonRecord) ?? {};

const validateCreateDto = (body: unknown): CreateCustomerDto | string => {
  const { email, name, phone } = asJsonRecord(body);

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return "email must be a valid email address.";
  }
  if (typeof name !== "string" || name.trim() === "") {
    return "name is required.";
  }
  if (typeof phone !== "string" || phone.trim() === "") {
    return "phone is required.";
  }

  return { email: email.trim(), name: name.trim(), phone: phone.trim() };
};

customersRouter.get("/", (_req: Request, res: Response) => {
  res.json(customersService.getCustomers());
});

customersRouter.get("/:email", (req: Request<{ email: string }>, res: Response) => {
  const { email } = req.params;
  const customer = customersService.getCustomerByEmail(email);
  if (!customer) {
    res.status(404).json({ error: `Customer with email '${email}' not found.` });
    return;
  }
  res.json(customer);
});

customersRouter.post("/", (req: Request, res: Response) => {
  const result = validateCreateDto(req.body);
  if (typeof result === "string") {
    res.status(400).json({ error: result });
    return;
  }

  const created = customersService.createCustomer(result);
  if (typeof created === "string") {
    res.status(409).json({ error: created });
    return;
  }

  res.status(201).json(created);
});
