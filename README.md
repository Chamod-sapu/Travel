# ✈️ TravelNest — Cloud-Native Travel Web Application

> **Module:** EC7205 — Cloud Computing | University of Ruhuna, Faculty of Engineering
> **Assignment 2 — Semester 7 | April 2026**
> **Team Size:** Maximum 4 members

---

## 📌 Project Overview

**TravelNest** is a scalable, secure, and highly available cloud-native travel platform built on a microservices architecture. Users can search and book flights, hotels, and tour packages, while the system handles payments and sends real-time notifications — all deployed on Oracle Cloud Infrastructure (OCI).

---

## 🏗️ System Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │          Oracle Cloud Infrastructure (OCI)   │
                        │                                               │
  React + Vite          │  ┌──────────────┐   OCI Load Balancer        │
  (Frontend)   ─────────┼─▶│  API Gateway │◀──────────────────────     │
  Tailwind CSS          │  │  (Port 8080) │                            │
  Lucide-react          │  └──────┬───────┘                            │
                        │         │  Routes                            │
                        │  ┌──────▼──────────────────────────────┐    │
                        │  │         Eureka Service Registry       │    │
                        │  │         (Service Discovery)           │    │
                        │  └──────┬──────────────────────────────┘    │
                        │         │                                    │
          ┌─────────────┼─────────┼─────────────────────────┐         │
          │             │         │  Microservices            │         │
          │  ┌──────────▼──┐  ┌───▼────────┐  ┌──────────┐  │         │
          │  │User Service  │  │Flight Svc  │  │Hotel Svc │  │         │
          │  │  (8081)      │  │  (8082)    │  │  (8083)  │  │         │
          │  └──────┬───────┘  └────┬───────┘  └────┬─────┘  │         │
          │         │               │               │         │         │
          │  ┌──────▼──┐  ┌─────────▼──┐  ┌────────▼──────┐ │         │
          │  │Package   │  │Payment Svc  │  │Notification  │ │         │
          │  │  Svc     │  │  (8085)     │  │  Svc (8086)  │ │         │
          │  │ (8084)   │  └─────────────┘  └──────────────┘ │         │
          └──┼──────────┼─────────────────────────────────────┘         │
             │          │                                                │
             │  ┌───────▼──────────────────────────────┐                │
             │  │         RabbitMQ Message Broker        │                │
             │  │    (Async: Payments → Notifications)   │                │
             │  └───────────────────────────────────────┘                │
             │                                                           │
             │  ┌───────────────────────────────────────┐               │
             │  │  OCI MySQL HeatWave (Per-Service DBs)  │               │
             │  │  travelnest_users | travelnest_flights  │               │
             │  │  travelnest_hotels | travelnest_packages│               │
             │  │  travelnest_payments                    │               │
             │  └───────────────────────────────────────┘               │
             └───────────────────────────────────────────────────────────┘
```

---

## 🧩 Microservices Breakdown (6 Services)

| # | Service | Port | Responsibility | Communication |
|---|---------|------|----------------|---------------|
| 1 | **API Gateway** | 8080 | Route, JWT validation, rate-limit | Synchronous (REST) |
| 2 | **User Service** | 8081 | Register, login, JWT auth, profile | Synchronous (REST) |
| 3 | **Flight Service** | 8082 | Search, list, and book flights | Synchronous (REST) |
| 4 | **Hotel Service** | 8083 | Search, list, and book hotels | Synchronous (REST) |
| 5 | **Package Service** | 8084 | Browse and book tour packages | Synchronous (REST) |
| 6 | **Payment Service** | 8085 | Process payments, refunds | Sync + Async (RabbitMQ) |
| 7 | **Notification Service** | 8086 | Email/in-app notifications | Asynchronous (RabbitMQ) |

---

## 🛠️ Technology Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide-react |
| HTTP Client | Axios |
| State Management | React Context / Zustand |
| Routing | React Router v6 |

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Architecture | Microservices |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Security | Spring Security + JWT |
| Messaging | RabbitMQ (Spring AMQP) |
| Inter-service Comm | OpenFeign (sync) |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (OCI OKE) |
| CI/CD | GitHub Actions |

### Database
| Service | Database |
|---------|---------|
| All Services | MySQL 8.x (OCI HeatWave) |
| Schema isolation | One schema per microservice |

### Cloud (Oracle Cloud Infrastructure)
| OCI Service | Purpose |
|------------|---------|
| OKE (Kubernetes Engine) | Container orchestration |
| OCI Load Balancer | Traffic distribution, SSL termination |
| OCI MySQL HeatWave | Managed relational database |
| OCI Object Storage | Static assets (images, documents) |
| OCI API Gateway | External API routing |
| OCI Vault | Secrets management |
| OCI Container Registry | Docker image storage |

---

## 📁 Project Structure

```
travelnest/
├── frontend/                         # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Footer, Loader
│   │   │   ├── flights/              # FlightCard, FlightSearch
│   │   │   ├── hotels/               # HotelCard, HotelSearch
│   │   │   └── packages/             # PackageCard, PackageList
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Flights.jsx
│   │   │   ├── Hotels.jsx
│   │   │   ├── Packages.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Payment.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/                 # API calls (Axios)
│   │   ├── context/                  # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── api-gateway/                  # Spring Cloud Gateway (8080)
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── service-registry/             # Eureka Server
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── user-service/                 # User & Auth (8081)
│   │   ├── src/
│   │   │   └── main/java/com/travelnest/user/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       ├── dto/
│   │   │       └── security/
│   │   ├── Dockerfile
│   │   └── pom.xml
│   │
│   ├── flight-service/               # Flight Management (8082)
│   ├── hotel-service/                # Hotel Management (8083)
│   ├── package-service/              # Tour Packages (8084)
│   ├── payment-service/              # Payments (8085)
│   └── notification-service/         # Notifications (8086)
│
├── infrastructure/
│   ├── docker-compose.yml            # Local development
│   ├── k8s/                          # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── user-service-deployment.yaml
│   │   ├── flight-service-deployment.yaml
│   │   ├── hotel-service-deployment.yaml
│   │   ├── package-service-deployment.yaml
│   │   ├── payment-service-deployment.yaml
│   │   ├── notification-service-deployment.yaml
│   │   ├── api-gateway-deployment.yaml
│   │   ├── service-registry-deployment.yaml
│   │   └── ingress.yaml
│   └── terraform/                    # OCI IaC (optional)
│
├── database/
│   └── schemas/
│       ├── users_schema.sql
│       ├── flights_schema.sql
│       ├── hotels_schema.sql
│       ├── packages_schema.sql
│       └── payments_schema.sql
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions Pipeline
│
└── README.md
```

---

## 🗄️ Database Schemas

### users_schema.sql
```sql
CREATE DATABASE IF NOT EXISTS travelnest_users;
USE travelnest_users;

CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### flights_schema.sql
```sql
CREATE DATABASE IF NOT EXISTS travelnest_flights;
USE travelnest_flights;

CREATE TABLE flights (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_number   VARCHAR(20) NOT NULL,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    departure_time  DATETIME NOT NULL,
    arrival_time    DATETIME NOT NULL,
    price           DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL
);

CREATE TABLE flight_bookings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_id   BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    seats       INT NOT NULL,
    status      ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    booked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);
```

### hotels_schema.sql
```sql
CREATE DATABASE IF NOT EXISTS travelnest_hotels;
USE travelnest_hotels;

CREATE TABLE hotels (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    location    VARCHAR(200) NOT NULL,
    rating      DECIMAL(2,1),
    price_per_night DECIMAL(10,2) NOT NULL,
    available_rooms INT NOT NULL
);

CREATE TABLE hotel_bookings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id    BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    check_in    DATE NOT NULL,
    check_out   DATE NOT NULL,
    rooms       INT NOT NULL,
    status      ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    booked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);
```

### packages_schema.sql
```sql
CREATE DATABASE IF NOT EXISTS travelnest_packages;
USE travelnest_packages;

CREATE TABLE tour_packages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    destination VARCHAR(150) NOT NULL,
    duration    INT NOT NULL COMMENT 'Days',
    price       DECIMAL(10,2) NOT NULL,
    max_people  INT NOT NULL
);

CREATE TABLE package_bookings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id  BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    people      INT NOT NULL,
    status      ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    booked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES tour_packages(id)
);
```

### payments_schema.sql
```sql
CREATE DATABASE IF NOT EXISTS travelnest_payments;
USE travelnest_payments;

CREATE TABLE payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    booking_ref     VARCHAR(100) NOT NULL,
    booking_type    ENUM('FLIGHT', 'HOTEL', 'PACKAGE') NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    status          ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    paid_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 REST API Endpoints

### User Service (8081)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login, returns JWT |
| GET | `/api/users/profile` | Get user profile (JWT required) |
| PUT | `/api/users/profile` | Update profile (JWT required) |

### Flight Service (8082)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights/search?origin=&destination=&date=` | Search flights |
| GET | `/api/flights/{id}` | Get flight by ID |
| POST | `/api/flights/book` | Book a flight (JWT required) |
| GET | `/api/flights/bookings/my` | Get user's bookings |
| DELETE | `/api/flights/bookings/{id}` | Cancel booking |

### Hotel Service (8083)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels/search?location=&checkIn=&checkOut=` | Search hotels |
| GET | `/api/hotels/{id}` | Get hotel by ID |
| POST | `/api/hotels/book` | Book a hotel (JWT required) |
| GET | `/api/hotels/bookings/my` | Get user's bookings |

### Package Service (8084)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | List all packages |
| GET | `/api/packages/{id}` | Get package by ID |
| POST | `/api/packages/book` | Book a package (JWT required) |

### Payment Service (8085)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment |
| GET | `/api/payments/{id}` | Get payment status |
| POST | `/api/payments/refund/{id}` | Request refund |

---

## ⚙️ Cloud Architecture — OCI Design

### Scalability
- All microservices deployed as **Kubernetes Deployments** on OCI OKE
- Horizontal Pod Autoscaler (HPA) configured for each service
- OCI Load Balancer distributes traffic across pods
- Database connection pooling via HikariCP

### High Availability
- Minimum **2 replicas** per service in Kubernetes
- OCI MySQL HeatWave with **read replicas**
- Multi-availability-domain deployment
- Health checks via Spring Actuator (`/actuator/health`)

### Security
- JWT tokens signed with RS256 for all protected routes
- API Gateway validates JWT before routing
- OCI Vault for storing DB credentials and secrets
- HTTPS enforced via OCI Load Balancer SSL termination
- Spring Security CORS configuration

### Communication
- **Synchronous:** REST via OpenFeign between services
- **Asynchronous:** RabbitMQ for Payment → Notification events
  - Queue: `payment.success` → triggers email confirmation
  - Queue: `booking.cancelled` → triggers cancellation email

---

## 🚀 Deployment Guide

### Prerequisites
- Java 17+
- Node.js 20+
- Docker & Docker Compose
- kubectl + OCI CLI configured
- MySQL 8.x (or OCI HeatWave)

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/travelnest.git
cd travelnest
```

---

### 2. Local Development with Docker Compose

```bash
# Start all services (including MySQL + RabbitMQ)
docker-compose up --build

# Services will be available at:
# Frontend:              http://localhost:5173
# API Gateway:           http://localhost:8080
# Eureka Dashboard:      http://localhost:8761
# RabbitMQ Management:   http://localhost:15672
```

**docker-compose.yml** (key excerpt):
```yaml
version: '3.8'
services:

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  service-registry:
    build: ./backend/service-registry
    ports:
      - "8761:8761"

  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - service-registry

  user-service:
    build: ./backend/user-service
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/travelnest_users
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
    depends_on:
      - mysql
      - service-registry

  # ... (flight, hotel, package, payment, notification services same pattern)

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - api-gateway
```

---

### 3. Database Setup
```bash
# Run schemas against your MySQL instance
mysql -u root -p < database/schemas/users_schema.sql
mysql -u root -p < database/schemas/flights_schema.sql
mysql -u root -p < database/schemas/hotels_schema.sql
mysql -u root -p < database/schemas/packages_schema.sql
mysql -u root -p < database/schemas/payments_schema.sql

# Load sample data
mysql -u root -p < database/sample_data.sql
```

---

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Development
npm run build       # Production build
```

---

### 5. Deploy to OCI (Kubernetes)

```bash
# Authenticate with OCI Container Registry
docker login <region>.ocir.io

# Build and push images
docker build -t <region>.ocir.io/<namespace>/user-service:latest ./backend/user-service
docker push <region>.ocir.io/<namespace>/user-service:latest
# (repeat for each service)

# Connect to OKE cluster
oci ce cluster create-kubeconfig --cluster-id <cluster-id> --region <region>

# Apply Kubernetes manifests
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/
```

---

### 6. Kubernetes Deployment Example (User Service)
```yaml
# infrastructure/k8s/user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: travelnest
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: <region>.ocir.io/<namespace>/user-service:latest
          ports:
            - containerPort: 8081
          env:
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8081
            initialDelaySeconds: 30
            periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
  namespace: travelnest
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

### 7. CI/CD — GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: TravelNest CI/CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Java 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build all services
        run: |
          cd backend/user-service && mvn package -DskipTests
          cd ../flight-service && mvn package -DskipTests
          # ... etc

      - name: Build & push Docker images
        run: |
          docker login ${{ secrets.OCI_REGISTRY }} -u ${{ secrets.OCI_USERNAME }} -p ${{ secrets.OCI_TOKEN }}
          docker build -t ${{ secrets.OCI_REGISTRY }}/user-service:${{ github.sha }} ./backend/user-service
          docker push ${{ secrets.OCI_REGISTRY }}/user-service:${{ github.sha }}

      - name: Deploy to OKE
        run: |
          kubectl set image deployment/user-service user-service=${{ secrets.OCI_REGISTRY }}/user-service:${{ github.sha }} -n travelnest
```

---

## 🌐 Core Features

- 🔐 **JWT Authentication** — Secure login/register with token-based auth
- ✈️ **Flight Search & Booking** — Search by origin, destination, date
- 🏨 **Hotel Search & Booking** — Filter by location, check-in/check-out
- 📦 **Tour Package Booking** — Browse curated packages by destination
- 💳 **Payment Processing** — Initiate and track payments per booking
- 🔔 **Real-time Notifications** — Email confirmations via async RabbitMQ events
- 📊 **User Dashboard** — Manage all bookings in one place

---

## 📊 Mark Allocation Mapping

| Criterion | Implementation |
|-----------|---------------|
| **Functionality (20%)** | 6 microservices, all core features working end-to-end |
| **Cloud-native architecture (20%)** | OCI OKE, Docker, Kubernetes, OCI services |
| **Scalability & availability (15%)** | HPA, multi-replica deployments, OCI Load Balancer |
| **Security (10%)** | JWT, Spring Security, OCI Vault, HTTPS |
| **Deployment & DevOps (10%)** | Docker Compose (local), K8s (cloud), GitHub Actions CI/CD |
| **Communication methods (10%)** | REST/OpenFeign (sync) + RabbitMQ (async) |
| **Documentation & clarity (15%)** | This README + architecture doc |

---

## 👥 Team Members

| Name | Student ID | Responsibility |
|------|-----------|----------------|
| Member 1 | | Frontend + API Gateway |
| Member 2 | | User Service + Payment Service |
| Member 3 | | Flight Service + Hotel Service |
| Member 4 | | Package Service + Notification + DevOps |

---

## 📝 License

This project is developed for academic purposes under the University of Ruhuna, Faculty of Engineering.