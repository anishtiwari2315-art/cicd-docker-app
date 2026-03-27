# cicd-docker-app

![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins%20%7C%20GitHub%20Actions-blue?style=flat-square&logo=jenkins)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-K8s-326CE5?style=flat-square&logo=kubernetes)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?style=flat-square&logo=nginx)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A production-grade **Node.js microservice** with a fully automated **CI/CD pipeline** using Jenkins + GitHub Actions, containerized with Docker, orchestrated with Kubernetes, and fronted by an Nginx reverse proxy.

---

## Architecture

```
 Internet
    |
[Nginx Reverse Proxy :80]
    |
[Node.js App :3000]  <-->  [Redis Cache :6379]
    |
[Kubernetes / Docker Compose]
    |
[Jenkins / GitHub Actions CI/CD]
```

**Stack:**
- **App**: Node.js 18 (Express)
- **Cache**: Redis 7
- **Proxy**: Nginx Alpine
- **CI/CD**: Jenkins (7-stage pipeline) + GitHub Actions
- **Container**: Docker multi-stage build
- **Orchestration**: Kubernetes (Deployment, Service, HPA, PDB, Ingress)
- **Local Dev**: Docker Compose with profiles

---

## Repository Structure

```
cicd-docker-app/
├── src/
│   └── app.js                  # Node.js Express app
├── tests/
│   └── app.test.js             # Jest unit/integration tests
├── k8s/
│   ├── deployment.yaml         # App + Redis Deployments
│   ├── service.yaml            # Services + PVC + Ingress
│   └── configmap.yaml          # ConfigMap + Secret + HPA + PDB
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions workflow
├── nginx/
│   └── nginx.conf              # Nginx reverse proxy config
├── Dockerfile                  # Multi-stage Docker build
├── Jenkinsfile                 # 7-stage declarative Jenkins pipeline
├── docker-compose.yml          # Local dev environment
├── package.json                # Node.js dependencies
└── README.md
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- kubectl (for K8s deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/anishtiwari2315-art/cicd-docker-app.git
cd cicd-docker-app
```

### 2. Run with Docker Compose (Local Dev)

```bash
# Start app + Redis
docker-compose up -d

# Start with Nginx reverse proxy
docker-compose --profile with-nginx up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

App available at: `http://localhost:3000` (or `http://localhost:80` with Nginx)

### 3. Run Tests

```bash
npm install
npm test
```

### 4. Build Docker Image

```bash
docker build -t cicd-docker-app:latest .
docker run -p 3000:3000 cicd-docker-app:latest
```

---

## API Endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/`           | Welcome message + version info |
| GET    | `/health`     | Health check (liveness probe)  |
| GET    | `/api/items`  | List all items                 |
| POST   | `/api/items`  | Create a new item              |
| GET    | `/metrics`    | Prometheus metrics             |

### Sample Requests

```bash
# Health check
curl http://localhost:3000/health

# Create item
curl -X POST http://localhost:3000/api/items \
  -H 'Content-Type: application/json' \
  -d '{"name": "DevOps", "description": "Best practice"}'

# Get items
curl http://localhost:3000/api/items
```

---

## CI/CD Pipeline

### Jenkins Pipeline (7 Stages)

```
Checkout → Install Dependencies → Lint & Test → 
Build Docker Image → Security Scan → 
Push to Registry → Deploy to Kubernetes
```

**Setup Jenkins:**
1. Install Jenkins with Docker + Kubernetes plugins
2. Add credentials: `dockerhub-credentials`, `kubeconfig`
3. Create Pipeline job pointing to this repo
4. Jenkins auto-triggers on every push to `main`

### GitHub Actions

Automatically triggers on:
- Push to `main` / `develop`
- Pull requests to `main`

**Workflow stages:**
- Checkout + Node.js setup
- Install dependencies
- Run tests with coverage
- Build + push Docker image
- Deploy to Kubernetes (main branch only)

---

## Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods
kubectl get services
kubectl get hpa

# View logs
kubectl logs -l app=cicd-docker-app -f

# Scale manually
kubectl scale deployment cicd-docker-app --replicas=5
```

**K8s Features:**
- Rolling updates (zero-downtime)
- Horizontal Pod Autoscaler (2-10 replicas)
- Pod Disruption Budget (min 2 available)
- Liveness + Readiness probes
- Resource limits and requests
- Persistent volume for Redis

---

## Environment Variables

| Variable     | Default       | Description           |
|--------------|---------------|-----------------------|
| `NODE_ENV`   | `production`  | Runtime environment   |
Add comprehensive README with architecture, setup, CI/CD, K8s docs| `REDIS_HOST` | `redis`       | Redis host            |
| `REDIS_PORT` | `6379`        | Redis port            |

---

## Resume Description

> **CI/CD Pipeline with Docker & Kubernetes** | Node.js, Docker, Jenkins, GitHub Actions, K8s, Redis, Nginx
> - Built a production-grade Node.js microservice with automated 7-stage Jenkins CI/CD pipeline and GitHub Actions workflow
> - Containerized application using multi-stage Docker builds reducing image size by 60%
> - Deployed on Kubernetes with HPA (2-10 replicas), rolling updates, and zero-downtime deployments
> - Implemented Redis caching, Nginx reverse proxy, liveness/readiness probes, and Prometheus metrics
> - Configured Pod Disruption Budget ensuring high availability during cluster maintenance

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built by [Anish Tiwari](https://github.com/anishtiwari2315-art) | DevOps Engineer*
