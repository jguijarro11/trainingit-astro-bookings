import express from "express";
import { healthRouter } from "./routes/health.router.js";
import { rocketsRouter } from "./routes/rockets.router.js";
import * as logger from "./logger.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/rockets", rocketsRouter);

app.listen(PORT, () => {
  logger.info(`AstroBookings API running on http://localhost:${PORT}`);
  logger.info(`AstroBookings healthcheck endpoint running on http://localhost:${PORT}/health`);
});
