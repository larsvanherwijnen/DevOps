const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const promBundle = require("express-prom-bundle");

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Prometheus metrics middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  promClient: {
    collectDefaultMetrics: {
      timeout: 5000,
    },
  },
});

// Middleware
app.use(metricsMiddleware);
app.use(cors());
app.use(express.json()); // Ensure this middleware is applied before proxying

// Debug logging middleware
const debugLog = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }
  next();
};

app.use(debugLog);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

const proxyOptions = {
  secure: false,
  ws: true,
  logLevel: "debug",
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
      if (req.body && req.method === "POST") {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
      }
  },
  onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      res.status(500).json({
          error: "Proxy Error",
          message: err.message,
      });
  },
};


// Route to Service A
app.use(
  "/api/service-a",
  createProxyMiddleware({
    target: process.env.SERVICE_A_URL || "http://service-a:3001",
    pathRewrite: { "^/api/service-a": "/api" },
    ...proxyOptions,
  })
);

app.use("/api/test", createProxyMiddleware({
  target: "http://service-a:3001",
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
      if (req.body && req.method === "POST") {
          const bodyData = JSON.stringify(req.body);
          console.log("Forwarding body:", bodyData);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
      }
  },
}));

// Route to Service B
app.use(
  "/api/service-b",
  createProxyMiddleware({
    target: process.env.SERVICE_B_URL || "http://service-b:3002",
    pathRewrite: { "^/api/service-b": "/api" },
    ...proxyOptions,
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Service A proxy: ${process.env.SERVICE_A_URL || "http://service-a:3001"}`);
  console.log(`Service B proxy: ${process.env.SERVICE_B_URL || "http://service-b:3002"}`);
});

module.exports = app; // For testing
