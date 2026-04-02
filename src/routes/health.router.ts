import { Router, type Request, type Response } from "express";

export const healthRouter = Router();

const STATUS_OK = "ok" as const;

healthRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    status: STATUS_OK,
    timestamp: new Date().toISOString(),
  });
});
