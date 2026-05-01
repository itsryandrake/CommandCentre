import dotenv from "dotenv";
dotenv.config({ override: true }); // .env takes precedence over shell env vars

import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health/index.ts";
import weatherRoutes from "./routes/weather.ts";
import tideRoutes from "./routes/tides.ts";
import calendarRoutes from "./routes/calendar.ts";
import reminderRoutes from "./routes/reminders.ts";
import goalRoutes from "./routes/goals.ts";
import crmRoutes from "./routes/crm.ts";
import visionBoardRoutes from "./routes/visionBoard.ts";
import chatRoutes from "./routes/chat.ts";
import equipmentRoutes from "./routes/equipment.ts";
import financeRoutes from "./routes/finance.ts";
import loyaltyRoutes from "./routes/loyalty.ts";
import shoppingRoutes from "./routes/shopping.ts";
import taskRoutes from "./routes/tasks.ts";
import wardrobeRoutes from "./routes/wardrobe.ts";
import lifeScriptRoutes from "./routes/lifeScripts.ts";
import documentRoutes from "./routes/documents.ts";
import investmentRoutes from "./routes/investments.ts";
import dreamHomeRoutes from "./routes/dreamHome.ts";
import restaurantRoutes from "./routes/restaurants.ts";
import { startHealthDataCron } from "./services/healthDataCron.ts";

const app = express();
const PORT = process.env.PORT || 6101;

// Configure CORS with allowed origins
const allowedOrigins = [
  'http://localhost:6100',      // Vite dev server
  'http://localhost:6101',      // Local API
  'https://drakefamily-ential.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/tides", tideRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/vision-board", visionBoardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/life-scripts", lifeScriptRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/dream-home", dreamHomeRoutes);
app.use("/api/restaurants", restaurantRoutes);

// Server status endpoint
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Drake Family CommandCentre running on port ${PORT}`);

  // Start the health data cron job
  startHealthDataCron();
});
