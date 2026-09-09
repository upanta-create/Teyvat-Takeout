# Teyvat Takeout Enterprise Helm Chart

Production-grade, enterprise Helm chart for deploying the **Teyvat Takeout** cloud-native food delivery platform across Kubernetes clusters (Minikube, Kind, AWS EKS, GKE, AKS).

---

## 🏗 Architecture & Features

This Helm chart manages the entire 3-tier distributed application:

- **Customer SPA Frontend**: Nginx-served React client with health probes.
- **Admin Operations Portal**: Nginx-served React administrative dashboard.
- **Backend REST API**: Node.js/Express service with `/healthz` and `/ready` probes, non-root security context, and PVC uploads.
- **Distributed Caching (Optional)**: In-cluster Redis 7.2-alpine deployment with ClusterIP service (can be toggled off for AWS ElastiCache / Redis Cloud).
- **Database (Optional)**: In-cluster MongoDB 7.0 StatefulSet with persistent volume claims (can be toggled off for MongoDB Atlas).
- **Horizontal Pod Autoscaling (HPA)**: CPU & memory utilization-based autoscaling for backend and frontend.
- **Unified Ingress**: Configurable for **AWS ALB Ingress Controller** (`alb`) or **NGINX Ingress** (`nginx`) with path-based routing.
- **Prometheus ServiceMonitor**: Native integration with Prometheus Operator for automated RED metrics scraping.
- **Zero-Downtime Rolling Updates**: Configured with `maxSurge: 1` and `maxUnavailable: 0`.

---

## 📋 Prerequisites

- Kubernetes 1.25+
- Helm 3.10+
- Ingress controller installed (AWS Load Balancer Controller or NGINX Ingress)
- *(Optional)* Prometheus Operator installed for ServiceMonitor CRDs

---

## 🚀 Quick Start

### 1. Local / Dev Cluster (Minikube / Kind)

Uses single-replica pods, in-cluster Redis & MongoDB, and local Nginx Ingress:

```bash
# Create namespace
kubectl create namespace teyvat-dev

# Install using development overrides
helm install teyvat ./helm/teyvat-takeout \
  -n teyvat-dev \
  -f ./helm/teyvat-takeout/values-dev.yaml
```

### 2. Production Cluster (AWS EKS)

Uses multi-replica high availability, AWS ALB Ingress, HPA, anti-affinity rules, and MongoDB Atlas / Redis Cloud:

```bash
# Create namespace
kubectl create namespace teyvat-takeout

# Install using production overrides
helm upgrade --install teyvat ./helm/teyvat-takeout \
  -n teyvat-takeout \
  -f ./helm/teyvat-takeout/values-prod.yaml \
  --set backend.secrets.mongoUrl="mongodb+srv://user:pass@cluster.mongodb.net/teyvat" \
  --set backend.secrets.jwtSecret="super-secure-production-secret-key"
```

---

## ⚙️ Key Configuration Parameters

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `global.environment` | Deployment environment tag (`development`, `staging`, `production`) | `production` |
| `global.domain` | Base domain name for ingress routing | `teyvat-takeout.example.com` |
| `backend.replicaCount` | Initial backend replica count | `2` |
| `backend.autoscaling.enabled` | Enable Horizontal Pod Autoscaler for API pods | `true` |
| `backend.autoscaling.minReplicas` | Minimum pod count under low traffic | `2` |
| `backend.autoscaling.maxReplicas` | Maximum pod count under peak traffic | `10` |
| `backend.resources.requests.cpu` | CPU request reservation | `200m` |
| `backend.resources.requests.memory` | Memory request reservation | `256Mi` |
| `backend.podSecurityContext.runAsNonRoot` | Run container as non-root user (UID 1000) | `true` |
| `backend.persistence.enabled` | Create PVC for `/app/uploads` | `true` |
| `frontend.replicaCount` | Customer UI replica count | `2` |
| `admin.replicaCount` | Admin portal replica count | `1` |
| `redis.enabled` | Deploy in-cluster Redis instance | `true` |
| `mongodb.enabled` | Deploy in-cluster MongoDB StatefulSet | `false` *(uses Atlas)* |
| `ingress.className` | Ingress class (`alb` or `nginx`) | `alb` |
| `serviceMonitor.enabled` | Deploy Prometheus Operator ServiceMonitor | `true` |

---

## 🔍 Verification & Health Checking

```bash
# Check all resources deployed by the chart
kubectl get all,ingress,hpa,pvc -n teyvat-takeout -l app.kubernetes.io/instance=teyvat

# Test backend health endpoints
kubectl exec -it deploy/teyvat-takeout-backend -n teyvat-takeout -- curl -s http://localhost:4000/ready
# Output: {"status":"ready","database":"connected","timestamp":"..."}

# Inspect Prometheus metrics
kubectl exec -it deploy/teyvat-takeout-backend -n teyvat-takeout -- curl -s http://localhost:4000/metrics | grep http_requests_total
```

---

## 🧹 Uninstalling

```bash
helm uninstall teyvat -n teyvat-takeout
```
