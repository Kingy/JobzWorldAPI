import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./database/connection";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

// Routes
import authRoutes from "./routes/auth.routes";
import candidateRoutes from "./routes/candidate.routes";
import videoRoutes from "./routes/video.routes";
import questionsRoutes from "./routes/questions.routes";
import stubRoutes from "./routes/stub-routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || "v1";

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  });
});

// API Routes
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/candidates", candidateRoutes);
apiRouter.use("/videos", videoRoutes);
apiRouter.use("/questions", questionsRoutes);

apiRouter.use("/users", stubRoutes.userRoutes);
apiRouter.use("/employers", stubRoutes.employerRoutes);
apiRouter.use("/jobs", stubRoutes.jobRoutes);
apiRouter.use("/applications", stubRoutes.applicationRoutes);
apiRouter.use("/messages", stubRoutes.messageRoutes);
apiRouter.use("/notifications", stubRoutes.notificationRoutes);
apiRouter.use("/files", stubRoutes.fileRoutes);
apiRouter.use("/matching", stubRoutes.matchingRoutes);
apiRouter.use("/billing", stubRoutes.billingRoutes);
apiRouter.use("/analytics", stubRoutes.analyticsRoutes);
apiRouter.use("/admin", stubRoutes.adminRoutes);

app.use(`/api/${API_VERSION}`, apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📚 API documentation available at http://localhost:${PORT}/api/${API_VERSION}`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

startServer();
