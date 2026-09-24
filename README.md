# Teyvat Takeout

A 3-tier food ordering and kitchen management application built with Node.js, React, and MongoDB, containerized with Docker, and configured for deployment on AWS EKS with Prometheus monitoring.

## Overview

The platform consists of three main components:
- **Frontend**: Customer-facing web application for browsing menus, managing cart items, and placing orders.
- **Admin**: Operations portal for food catalog management and order status tracking.
- **Backend**: Express REST API handling user authentication, order workflows, Stripe payment sessions, and Prometheus RED metrics.

## Tech Stack

- **Backend**: Node.js (v20), Express, MongoDB (Mongoose), prom-client, Winston, Stripe API
- **Frontend & Admin**: React 18, Vite, React Router, Axios
- **Containerization**: Docker, Docker Compose, Nginx
- **Infrastructure**: Terraform, AWS (VPC, EKS 1.29, IAM IRSA, ALB)
- **Kubernetes**: Deployments, StatefulSets, Services, AWS ALB Ingress, HPA
- **Observability**: Prometheus Operator, Grafana, Alertmanager
- **CI/CD**: GitHub Actions, Trivy

## Project Structure

```
.
├── admin/                  # React admin portal
├── backend/                # Express API and metrics middleware
├── frontend/               # Customer React application
├── k8s/                    # Kubernetes manifests (deployments, ingress, hpa)
├── monitoring/             # Prometheus alert rules and Grafana dashboard
├── terraform/              # Modular IaC for AWS VPC, EKS, and IAM IRSA
├── docker-compose.yml      # Local multi-container setup
└── README.md
```

## Observability & Metrics

The backend exposes application metrics at `/metrics` using `prom-client`:

- `http_requests_total`: Total HTTP requests partitioned by method, route, and status code.
- `http_request_duration_seconds`: Histogram measuring request latency across configurable buckets.
- `http_request_errors_total`: Counter for 4xx and 5xx response codes.
- `http_active_requests`: Gauge tracking in-flight requests.
- `teyvat_orders_total`: Counter tracking order creation and verification states.

### Health Probes
- `GET /healthz`: Basic liveness probe returning HTTP 200.
- `GET /ready`: Readiness probe verifying MongoDB connectivity before accepting traffic.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development outside containers)
- MongoDB instance (or Docker)

### Run with Docker Compose

To start all services locally (Frontend, Admin, Backend, MongoDB, Prometheus, Grafana):

```bash
docker compose up --build -d
```

Service endpoints:
- Customer UI: `http://localhost:5173`
- Admin Portal: `http://localhost:5174`
- Backend API: `http://localhost:4000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (default login: admin / admin)

### Manual Local Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Admin**
   ```bash
   cd admin
   npm install
   npm run dev
   ```

## Kubernetes Deployment

Deploy manifests to an active Kubernetes cluster:

```bash
# Create namespace, configs, and secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml.example

# Deploy database and workloads
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/admin-deployment.yaml
kubectl apply -f k8s/admin-service.yaml

# Apply Ingress and autoscaler
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

## Terraform Infrastructure

To provision the AWS infrastructure (VPC, EKS, Node Groups, IAM IRSA):

```bash
cd terraform/environments/prod
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Environment Variables

| Variable | Location | Description | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | `backend/.env` | Backend API port | `4000` |
| `MONGO_URL` | `backend/.env` | MongoDB connection string | `mongodb://127.0.0.1:27017/teyvat_takeout` |
| `JWT_SECRET` | `backend/.env` | Secret for signing JWT tokens | `teyvat_takeout_super_secret_jwt_key_2026` |
| `STRIPE_SECRET_KEY` | `backend/.env` | Stripe API secret key | `sk_test_...` |
| `FRONTEND_URL` | `backend/.env` | Frontend base URL for payment callbacks | `http://localhost:5173` |
| `VITE_BACKEND_URL` | `frontend/.env`, `admin/.env` | Backend API URL for client requests | `http://localhost:4000` |

## License

MIT
