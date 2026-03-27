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

// ---- Health check endpoint (used by K8s liveness/readiness probes) ----
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
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
    message: 'CI/CD Pipeline - Dockerised Microservice',
    version: APP_VERSION,
    environment: ENVIRONMENT,
    hostname: os.hostname(),
    uptime: `${Math.floor(process.uptime())}s`,
    author: 'Anish Tiwari',
    stack: ['Node.js', 'Docker', 'Jenkins', 'GitHub Actions', 'Kubernetes']
  });
});

// ---- API Info endpoint ----
app.get('/api/info', (req, res) => {
  res.status(200).json({
    service: 'cicd-docker-app',
    version: APP_VERSION,
    environment: ENVIRONMENT,
    nodeVersion: process.version,
    platform: os.platform(),
    hostname: os.hostname(),
    memory: {
      total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      free: `${Math.round(os.freemem() / 1024 / 1024)} MB`
    },
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---- Start server ----
const server = app.listen(PORT, () => {
  console.log(`[cicd-docker-app] Server running on port ${PORT}`);
  console.log(`[cicd-docker-app] Environment: ${ENVIRONMENT}`);
  console.log(`[cicd-docker-app] Version: ${APP_VERSION}`);
});

// ---- Graceful shutdown ----
process.on('SIGTERM', () => {
  console.log('[cicd-docker-app] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[cicd-docker-app] Process terminated.');
    process.exit(0);
  });
});

module.exports = app;
