const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { errorHandler, notFound } = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const workflowRoutes = require("./routes/workflow.routes");
const executionRoutes = require("./routes/execution.routes");
const webhookRoutes = require("./routes/webhook.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://ai-trigger-x.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ── Request parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/webhook", webhookRoutes);   // public — no /api prefix auth
app.use("/api/ai", aiRoutes);

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;