import express from "express";
import { healthRouter } from "./routes/health.router.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());

app.use("/health", healthRouter);

app.listen(PORT, () => {
  console.log(`AstroBookings API running on http://localhost:${PORT}`);
});
