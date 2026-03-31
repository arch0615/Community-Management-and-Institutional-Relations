import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import "./config/passport";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import contactsRoutes from "./modules/contacts/contacts.routes";
import segmentationRoutes from "./modules/segmentation/segmentation.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import messagingRoutes from "./modules/messaging/messaging.routes";
import metaRoutes from "./modules/meta-integration/meta.routes";
import adminRoutes from "./modules/admin/admin.routes";
import campaignsRoutes from "./modules/campaigns/campaigns.routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ──────────────────────────────────────────

// General API: 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intenta de nuevo en un momento" },
});

// Auth endpoints: 10 requests per minute per IP (login/register)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de autenticación, intenta de nuevo en un momento" },
});

// Import/Export: 5 requests per minute per IP
const importExportLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes de importación/exportación, intenta de nuevo en un momento" },
});

// Campaign send: 10 requests per minute per IP
const campaignSendLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes de envío, intenta de nuevo en un momento" },
});

// Apply general limiter to all API routes
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes (stricter limiters applied to specific routes)
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/contacts/import", importExportLimiter);
app.use("/api/contacts/export", importExportLimiter);
app.use("/api/campaigns/:id/send", campaignSendLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/segments", segmentationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/messages", messagingRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns", campaignsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;
