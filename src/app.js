// ============================================================
// app.js - Main Express Microservice
// CI/CD Pipeline for Dockerised Microservices
// Author: Anish Tiwari | DevOps Engineer | Pune, India
// ============================================================

const express = require('express');
const os = require('os');
const app = express();

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

app.use(express.json());

// Simple request counter for metrics
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  next();
});

// ---- Health check endpoint (used by K8s liveness/readiness probes) ----
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ---- Readiness probe ----
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// ---- Root endpoint ----
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'CI/CD Docker App is running!',
    version: APP_VERSION,
    environment: ENVIRONMENT
  });
});

// ---- API items (in-memory store) ----
let items = [];
let nextId = 1;

app.get('/api/items', (req, res) => {
  res.status(200).json(items);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const item = { id: nextId++, name, description: description || '' };
  items.push(item);
  res.status(201).json(item);
});

// ---- Prometheus-style metrics ----
app.get('/metrics', (req, res) => {
  const metrics = [
    `# HELP http_requests_total Total number of HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total ${requestCount}`,
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime()}`
  ].join('\n');
  res.status(200).set('Content-Type', 'text/plain').send(metrics);
});

// ---- API info ----
app.get('/api/info', (req, res) => {
  res.status(200).json({
    version: APP_VERSION,
    environment: ENVIRONMENT,
    memory: {
      total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      free: `${Math.round(os.freemem() / 1024 / 1024)} MB`
    },
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// ---- Start server (only if not in test) ----
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Version: ${APP_VERSION}`);
  });
}

module.exports = app;
