# Teyvat Takeout — Full-Stack Food Delivery Platform

> A production-grade, cloud-native food delivery application built with the MERN stack, containerized with Docker, orchestrated on Kubernetes (AWS EKS), and monitored with Prometheus + Grafana. Features real-time order tracking (SSE), Redis distributed caching, JWT authentication, Stripe payment integration, and a complete CI/CD pipeline via GitHub Actions.

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions)](https://github.com/upanta-create/Teyvat-Takeout/actions)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://hub.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS%201.29-326CE5?logo=kubernetes)](https://aws.amazon.com/eks/)
[![Helm](https://img.shields.io/badge/Helm-v3%20Enterprise%20Chart-0F1689?logo=helm)](./helm/teyvat-takeout)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis)](https://redis.io)
[![Prometheus](https://img.shields.io/badge/Prometheus-RED%20Metrics-E6522C?logo=prometheus)](https://prometheus.io)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EKS Cluster                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Frontend │  │  Admin   │  │ Backend  │  ← Nginx Ingress │
│  │  React   │  │  React   │  │ Express  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │             │                        │
│       └──────────────┴──────┬──────┘                        │
│                             │                              │
│               ┌─────────────┴──────────────┐               │
│               │       Redis Cache (7.2)     │               │
│               └─────────────┬──────────────┘               │
│                             │                              │
│               ┌─────────────┴──────────────┐               │
│               │     MongoDB StatefulSet     │               │
│               └────────────────────────────┘               │
│                                                            │
│  ┌────────────────────┐  ┌──────────────────┐              │
│  │ Prometheus Operator│  │  Grafana 10.3    │              │
│  └────────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features & Engineering Decisions

| Feature | Implementation | Keywords |
|---------|---------------|----------|
| **Real-Time Order Tracking** | Server-Sent Events (SSE) — event-driven streaming, zero-polling | SSE, Event-Driven, WebStreaming |
| **Distributed Caching** | Redis Cache-Aside pattern, TTL-based invalidation, graceful degradation | Redis, Caching, Performance |
| **Full-Text Search** | MongoDB text index with weighted scoring (name 3x, desc 2x, category 1x) | Search, MongoDB Indexes, Query Optimization |
| **Rate Limiting** | Tiered `express-rate-limit`: 10 auth / 200 public / 30 order / 150 admin per 15min | Security, DDoS Mitigation, API Throttling |
| **Input Validation** | `express-validator` schema validation on all write endpoints | Input Sanitization, Secure Coding |
| **Transactional Email** | Nodemailer on order confirm + status change with branded HTML templates | Notifications, Event-Driven |
| **JWT Authentication** | Stateless auth, bcrypt password hashing, RBAC (admin/user roles) | JWT, Auth, RBAC, bcrypt |
| **Payment Processing** | Stripe Checkout sessions with INR currency, webhook redirect handling | Stripe, Payment Gateway |
| **Binary Storage** | GridFS for image files in MongoDB, fallback to CDN URL | GridFS, MongoDB, Binary Storage |
| **Observability** | Prometheus RED metrics, custom business metrics (`teyvat_orders_total`), Grafana dashboards, alert rules | Prometheus, Grafana, Observability, SRE |
| **Structured Logging** | Winston JSON logging with log levels, service metadata | Winston, Logging, Structured Logs |
| **K8s Health Probes** | `/healthz` (liveness) + `/ready` (readiness with DB check) | Kubernetes, Health Probes, SRE |
| **Graceful Shutdown** | SIGTERM/SIGINT handlers with MongoDB drain, 10s force timeout | Zero-Downtime, K8s Rolling Updates |
| **HPA Autoscaling** | CPU/memory-based Horizontal Pod Autoscaler on backend deployment | HPA, Autoscaling, Kubernetes |
| **IaC** | Terraform modules — AWS VPC, EKS 1.29, Node Groups, IAM IRSA | Terraform, IaC, AWS, EKS |
| **Packaging & Delivery** | Enterprise Helm v3 chart with dev/prod values overrides, ServiceMonitor | Helm, Kubernetes, Package Management |
| **CI/CD Pipeline** | GitHub Actions: lint/build → Trivy CVE scan → GHCR push → EKS rollout | CI/CD, GitHub Actions, Trivy, Security Scanning |

---

## Tech Stack

### Application
- **Frontend**: React 18, Vite, React Router DOM, Axios, Context API
- **Admin Portal**: React 18, Vite, Recharts (analytics dashboard)
- **Backend API**: Node.js 20, Express 4, Mongoose 8, Multer

### Data & Caching
- **Database**: MongoDB Atlas + local StatefulSet, Mongoose ODM, text indexes
- **Cache**: Redis 7.2 (Cache-Aside, TTL invalidation, LRU eviction policy)
- **File Storage**: GridFS (MongoDB) for binary image storage

### Security
- **Auth**: JWT (jsonwebtoken), bcrypt password hashing, Admin RBAC
- **Protection**: express-rate-limit (tiered), express-validator (schema validation)
- **CVE Scanning**: Trivy filesystem + container image scanning

### DevOps & Infrastructure
- **Containers**: Docker, Docker Compose (7-service local stack)
- **Orchestration**: Kubernetes 1.29 (AWS EKS), StatefulSets, Deployments, HPA, Nginx Ingress
- **Package Management**: Helm v3 Enterprise Chart (`helm/teyvat-takeout`) with dev/prod profiles
- **IaC**: Terraform (VPC, EKS, IAM IRSA, Node Groups)
- **CI/CD**: GitHub Actions (4-stage pipeline), GHCR registry
- **Monitoring**: Prometheus Operator, Grafana, Alertmanager, prom-client
- **Logging**: Winston (JSON structured logs)

---

## Getting Started

### Quick Start with Docker Compose

```bash
# Clone and start all 8 services (Frontend, Admin, Backend, MongoDB, Redis, Prometheus, Grafana)
git clone https://github.com/upanta-create/Teyvat-Takeout.git
cd Teyvat-Takeout
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Customer Frontend | http://localhost:5173 |
| Admin Portal | http://localhost:5174 |
| Backend REST API | http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |

### Manual Local Development

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Admin (new terminal)
cd admin && npm install && npm run dev
```

---

## API Reference

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|-----------|-------------|
| `POST` | `/api/user/register` | — | 10/15min | User registration with validation |
| `POST` | `/api/user/login` | — | 10/15min | JWT authentication |
| `GET` | `/api/food/list` | — | 200/15min | Menu catalog (Redis cached) |
| `GET` | `/api/food/search?q=&category=&minPrice=` | — | 200/15min | Full-text search + filters |
| `POST` | `/api/food/add` | Admin JWT | 150/15min | Add dish (GridFS image upload) |
| `POST` | `/api/food/update` | Admin JWT | 150/15min | Edit dish + cache invalidation |
| `POST` | `/api/order/place` | JWT | 30/15min | Stripe checkout session |
| `POST` | `/api/order/verify` | — | 200/15min | Payment verification + email |
| `GET` | `/api/order/track/:orderId` | JWT | — | SSE real-time order tracking |
| `POST` | `/api/order/status` | Admin JWT | 150/15min | Update status + email notification |
| `GET` | `/api/category/list` | — | 200/15min | Active food categories |
| `GET` | `/metrics` | — | — | Prometheus RED metrics scrape |
| `GET` | `/healthz` | — | — | Kubernetes liveness probe |
| `GET` | `/ready` | — | — | Kubernetes readiness probe |

---

## Observability

### Prometheus Metrics (`/metrics`)
- `http_requests_total` — Request rate by method, route, status code
- `http_request_duration_seconds` — Latency histogram (11 buckets, 5ms–10s)
- `http_request_errors_total` — Error rate for 4xx/5xx responses
- `http_active_requests` — In-flight request gauge
- `teyvat_orders_total` — Business domain orders counter (created/paid/cancelled)
- Node.js runtime defaults: GC, event loop lag, heap memory, CPU

### Alert Rules
- `HighErrorRate` — 5xx rate > 5% over 5 minutes
- `HighLatency` — p95 latency > 1s over 10 minutes
- `BackendDown` — Service unreachable for > 2 minutes

---

## Kubernetes Deployment

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/admin-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## Terraform Infrastructure

```bash
cd terraform/environments/prod
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Provisions: AWS VPC (multi-AZ), EKS 1.29 cluster, managed Node Groups, IAM IRSA for pod-level AWS permissions.

---

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URL` | `backend/.env` | MongoDB connection string |
| `REDIS_URL` | `backend/.env` | Redis connection URL (`redis://localhost:6379`) |
| `JWT_SECRET` | `backend/.env` | JWT signing secret |
| `STRIPE_SECRET_KEY` | `backend/.env` | Stripe API secret |
| `SMTP_HOST` | `backend/.env` | Email SMTP server (optional — uses Ethereal in dev) |
| `SMTP_USER` | `backend/.env` | SMTP username |
| `SMTP_PASS` | `backend/.env` | SMTP password |
| `FRONTEND_URL` | `backend/.env` | Frontend base URL for redirects |
| `VITE_BACKEND_URL` | `frontend/.env` | API base URL for React clients |

---

## License

MIT — Built by [upanta-create](https://github.com/upanta-create)
