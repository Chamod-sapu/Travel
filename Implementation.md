# TravelNest — Implementation Document

**Module:** EC7205 — Cloud Computing
**Faculty of Engineering, University of Ruhuna**
**Assignment 2 — Semester 7 | April 2026**

---

## 1. Introduction

### 1.1 Project Overview

TravelNest is a cloud-native travel web application designed and implemented as part of the EC7205 Cloud Computing module. The application enables users to search and book flights, hotels, and tour packages through a unified platform. It is purpose-built to demonstrate core cloud computing principles including scalability, high availability, security, and modern deployment practices using industry-standard tools and architecture patterns.

The platform targets real-world use cases where a travel booking system must handle variable and often unpredictable user loads — such as seasonal demand spikes — while remaining fault-tolerant, secure, and easy to maintain and extend. This makes it an ideal candidate to validate cloud-native design decisions in a practical setting.

### 1.2 Motivation

Traditional monolithic applications struggle to meet the demands of modern cloud environments. They are difficult to scale independently, prone to single points of failure, and costly to maintain as the codebase grows. TravelNest was designed from the ground up with a microservices architecture to directly address these limitations, providing hands-on experience in decomposing a real-world system into independently deployable, loosely coupled services.

### 1.3 Scope

The application covers the following functional areas:

- User registration, authentication, and profile management
- Flight search and booking with real-time seat availability
- Hotel search and booking with date-based pricing
- Tour package browsing and booking
- Payment processing with event-driven confirmation flow
- Automated email notifications triggered asynchronously upon payment

---

## 2. Architecture

### 2.1 Architectural Style — Microservices

TravelNest follows a microservices architectural style where each business capability is encapsulated within its own independently deployable service. Each service owns its database schema (Database-per-Service pattern), communicates over well-defined APIs, and is packaged as a Docker container deployed on Kubernetes.

### 2.2 System Architecture Diagram

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                  Oracle Cloud Infrastructure (OCI)               │
  │                                                                   │
  │   React + Vite Frontend                                          │
  │   (Served via OCI Load Balancer)                                 │
  │           │                                                       │
  │           ▼                                                       │
  │   ┌───────────────┐        OCI Load Balancer (SSL Termination)   │
  │   │  API Gateway  │◀────────────────────────────────────────     │
  │   │   (Port 8080) │                                              │
  │   └──────┬────────┘                                              │
  │          │  JWT Validated & Routed                               │
  │   ┌──────▼────────────────────────────────────────────┐         │
  │   │             Eureka Service Registry (8761)          │         │
  │   └──────┬──────────────────────────┬─────────────────┘         │
  │          │                          │                            │
  │  ┌───────┼──────────────────────────┼──────────────┐            │
  │  │       │     Microservices         │              │            │
  │  │  ┌────▼──────┐  ┌────────────┐  ┌▼──────────┐  │            │
  │  │  │User Svc   │  │Flight Svc  │  │Hotel Svc  │  │            │
  │  │  │  (8081)   │  │  (8082)    │  │  (8083)   │  │            │
  │  │  └───────────┘  └────────────┘  └───────────┘  │            │
  │  │  ┌────────────┐  ┌───────────┐  ┌───────────┐  │            │
  │  │  │Package Svc │  │Payment Svc│  │Notif. Svc │  │            │
  │  │  │  (8084)    │  │  (8085)   │  │  (8086)   │  │            │
  │  │  └────────────┘  └─────┬─────┘  └─────▲─────┘  │            │
  │  └──────────────────────── │──────────────│─────────┘            │
  │                            │  RabbitMQ    │                      │
  │                    ┌───────▼──────────────┴──────┐               │
  │                    │   RabbitMQ Message Broker    │               │
  │                    │  Queue: payment.confirmed    │               │
  │                    └─────────────────────────────┘               │
  │                                                                   │
  │   ┌───────────────────────────────────────────────────────┐      │
  │   │         OCI MySQL HeatWave (Managed Database)          │      │
  │   │  travelnest_users | travelnest_flights | travelnest_   │      │
  │   │  hotels | travelnest_packages | travelnest_payments    │      │
  │   └───────────────────────────────────────────────────────┘      │
  └─────────────────────────────────────────────────────────────────┘
```

### 2.3 Microservices Overview

| Service | Port | Technology | Responsibility |
|---------|------|-----------|----------------|
| API Gateway | 8080 | Spring Cloud Gateway | JWT validation, request routing, rate limiting |
| Service Registry | 8761 | Netflix Eureka | Service discovery and registration |
| User Service | 8081 | Spring Boot + MySQL | Authentication, JWT issuance, user profiles |
| Flight Service | 8082 | Spring Boot + MySQL | Flight search, booking, cancellation |
| Hotel Service | 8083 | Spring Boot + MySQL | Hotel search, booking, cancellation |
| Package Service | 8084 | Spring Boot + MySQL | Tour package catalogue and bookings |
| Payment Service | 8085 | Spring Boot + MySQL + RabbitMQ | Payment processing, event publishing |
| Notification Service | 8086 | Spring Boot + RabbitMQ | Email notification delivery |

### 2.4 Communication Patterns

**Synchronous Communication (REST via OpenFeign)**
All client-facing operations — searching, browsing, and booking — are handled synchronously. The frontend communicates with the API Gateway, which routes to individual services via load-balanced Eureka discovery. Inter-service calls (e.g., API Gateway validating tokens with User Service) also use synchronous REST through Spring Cloud OpenFeign.

**Asynchronous Communication (RabbitMQ)**
After a payment is successfully processed, the Payment Service publishes a `PaymentEvent` message to the `travelnest.exchange` RabbitMQ exchange using the routing key `payment.confirmed`. The Notification Service subscribes to the `payment.confirmed` queue and independently processes the event to send a confirmation email. This decoupling ensures that a delay or failure in email delivery does not impact the payment transaction itself.

```
Payment Service                 RabbitMQ                  Notification Service
      │                            │                              │
      │── publish(PaymentEvent) ──▶│                              │
      │                            │──── deliver(PaymentEvent) ──▶│
      │                            │                              │── send email
      │   (continues independently)│                              │
```

### 2.5 Security Architecture

Security is applied in layers across the system:

- **Transport Layer:** HTTPS enforced via OCI Load Balancer SSL termination. All inter-service communication within the Kubernetes cluster uses internal ClusterIP services.
- **Authentication:** The User Service issues JWT tokens (RS256 algorithm) upon successful login. The private key is held exclusively by the User Service; all other services share only the public key for verification.
- **Authorization:** The API Gateway applies a JWT validation filter to all routes except `/api/users/register` and `/api/users/login`. Invalid or missing tokens result in a 401 Unauthorized response before the request reaches any downstream service.
- **Secrets Management:** Database credentials, JWT keys, and SMTP passwords are stored in OCI Vault and injected into Kubernetes pods as Kubernetes Secrets — never hardcoded in application code or Docker images.
- **Password Storage:** All user passwords are hashed using BCrypt before persistence.

### 2.6 Cloud Infrastructure (OCI)

| OCI Service | Purpose |
|------------|---------|
| OKE (Kubernetes Engine) | Container orchestration for all microservices |
| OCI Load Balancer | External traffic entry, SSL termination, frontend serving |
| OCI MySQL HeatWave | Fully managed relational database with high availability |
| OCI Container Registry | Private Docker image registry |
| OCI Vault | Secrets management (DB passwords, JWT keys, SMTP credentials) |
| OCI Object Storage | Static asset storage (hotel/package images) |

---

## 3. Implementation Steps

### Step 1 — Project Scaffolding and Version Control

The project was initialized as a multi-module structure with separate directories for frontend, backend services, infrastructure manifests, and database schemas. A Git repository was created on GitHub with `main` as the protected production branch and feature branches for each service. Branch protection rules enforced pull request reviews before merging.

```
travelnest/
├── frontend/           # React + Vite application
├── backend/
│   ├── service-registry/
│   ├── api-gateway/
│   ├── user-service/
│   ├── flight-service/
│   ├── hotel-service/
│   ├── package-service/
│   ├── payment-service/
│   └── notification-service/
├── infrastructure/
│   ├── docker-compose.yml
│   └── k8s/
├── database/schemas/
└── .github/workflows/
```

### Step 2 — Database Design and Schema Creation

Each microservice was given an isolated MySQL schema following the Database-per-Service pattern. Schemas were written as SQL migration scripts and version-controlled under `database/schemas/`. Sample data was prepared separately in `database/sample_data.sql` covering 3 users, 10 flights, 8 hotels, and 6 tour packages with realistic pricing and dates.

Relationships within a service (e.g., `flight_bookings.flight_id` → `flights.id`) use traditional foreign keys. Cross-service references (e.g., storing `user_id` in `flight_bookings`) store only the identifier without a foreign key constraint, maintaining service independence.

### Step 3 — Service Registry and API Gateway

The Eureka Service Registry was implemented first as it is a prerequisite for all other services. It runs as a standalone Eureka server with self-registration disabled.

The API Gateway was implemented next using Spring Cloud Gateway (reactive, not servlet-based). A custom `JwtAuthFilter` was written as a `GatewayFilter` that:
1. Checks whether the incoming request path is on the public whitelist
2. Extracts the `Authorization: Bearer <token>` header
3. Validates the JWT signature using the RS256 public key
4. Forwards the request downstream if valid, or returns 401 if invalid

Route configuration in `application.yml` maps URI prefixes to Eureka service IDs using `lb://` (load-balanced) routing.

### Step 4 — User Service (Authentication Foundation)

The User Service was implemented before all other business services because it establishes the JWT infrastructure consumed by the entire system. Key implementation details:

- RSA-2048 key pair generated and stored — private key in User Service, public key distributed to all other services via environment configuration
- `JwtService` class handles token generation (signing with private key, 24-hour expiry, claims: `sub`, `userId`, `role`) and token parsing (verification with public key)
- Spring Security configured to permit only `/api/users/register` and `/api/users/login` without authentication
- Passwords stored as BCrypt hashes using `PasswordEncoder`

### Step 5 — Business Microservices (Flight, Hotel, Package)

Flight, Hotel, and Package services were implemented following the same structural pattern:

- Entity → Repository (JpaRepository) → Service Interface → Service Implementation → Controller → DTOs
- Each service validates the JWT locally by decoding the token using the shared RS256 public key — no network call to User Service per request
- `userId` is extracted from JWT claims in the controller and passed down to the service layer for ownership-scoped queries (e.g., "get my bookings")
- Booking endpoints use `@Transactional` to atomically update availability counts and create booking records, preventing race conditions under concurrent requests

### Step 6 — Payment Service and Asynchronous Messaging

The Payment Service handles payment initiation and refunds. Upon a successful payment:

1. The payment record is persisted with status `SUCCESS`
2. A `PaymentEvent` object (containing `userId`, `userEmail`, `bookingRef`, `bookingType`, `amount`) is serialized to JSON and published to RabbitMQ via `RabbitTemplate`

RabbitMQ configuration declares:
- A `DirectExchange` named `travelnest.exchange`
- A durable queue `payment.confirmed`
- A binding linking the queue to the exchange with routing key `payment.confirmed`

### Step 7 — Notification Service

The Notification Service is a lightweight, stateless consumer. A `@RabbitListener` method annotated with the queue name automatically deserializes incoming messages into `PaymentEvent` objects. The `EmailService` then uses `JavaMailSender` to send a formatted booking confirmation email. If SMTP is not configured in the environment, the service gracefully falls back to logging the email content — which was used during local development to verify the async flow without a live mail server.

### Step 8 — Frontend Development

The React frontend was built with Vite for fast development builds. Key implementation decisions:

- A centralized Axios instance in `services/api.js` adds the JWT `Authorization` header to every outgoing request via an Axios request interceptor, reading the token from `localStorage`
- `AuthContext` provides global authentication state (user object, `isAuthenticated`, `login()`, `logout()`) to all components via React Context
- `PrivateRoute` wraps protected pages and redirects unauthenticated users to `/login`
- Search forms (flights, hotels, packages) call the API Gateway through the Axios instance and render results as cards using Lucide-react icons for visual consistency

### Step 9 — Containerization

Each service was containerized using a multi-stage Dockerfile:
- **Stage 1 (Build):** Maven builds the JAR using a Maven + JDK 17 base image
- **Stage 2 (Runtime):** The JAR is copied into a lightweight JRE 17 slim image, reducing the final image size significantly

A `docker-compose.yml` was written to start the entire stack locally with a single command (`docker-compose up --build`), including MySQL, RabbitMQ, all backend services, and the frontend. Health checks on MySQL and RabbitMQ ensure dependent services wait for their dependencies to be ready.

### Step 10 — Kubernetes Deployment on OCI OKE

All services were deployed to OCI Kubernetes Engine using manifest files under `infrastructure/k8s/`:

- **Namespace:** `travelnest` isolates all resources
- **Deployments:** Each service runs with a minimum of 2 replicas for high availability
- **Services:** ClusterIP for internal communication; LoadBalancer type for the API Gateway
- **HorizontalPodAutoscaler (HPA):** Configured for each service with a CPU utilization target of 70%, scaling between 2 and 5 replicas automatically
- **Secrets:** A Kubernetes Secret (`db-secret`) stores base64-encoded database credentials synced from OCI Vault
- **ConfigMap:** Shared configuration (Eureka URI, RabbitMQ host) injected as environment variables
- **Readiness and Liveness Probes:** Configured via Spring Boot Actuator's `/actuator/health` endpoint to prevent traffic routing to pods that are not yet ready

Docker images were pushed to OCI Container Registry and referenced in deployment manifests using the OCI registry URL.

### Step 11 — CI/CD Pipeline

A GitHub Actions workflow automates the build and deployment pipeline on every push to `main`:

1. **Test Stage:** Runs `mvn test` for all services in parallel using a matrix strategy
2. **Build Stage:** Packages JARs, builds Docker images tagged with `github.sha`, and pushes to OCI Container Registry
3. **Deploy Stage:** Updates Kubernetes deployments using `kubectl set image` with the new image tag, followed by `kubectl rollout status` to confirm successful rollout

A separate `pr-check.yml` workflow runs tests on every pull request to `main`, preventing broken code from merging.

---

## 4. Challenges Faced

**JWT Public Key Distribution**
Sharing the RSA public key across all services required careful environment variable management. Initially, newline characters in the PEM-formatted key caused parsing failures when injected as environment variables. This was resolved by base64-encoding the key, passing it as a single environment variable, and decoding it at application startup.

**Cross-Origin Resource Sharing (CORS)**
During development, the React frontend (running on port 5173) was blocked by browser CORS policies when calling the API Gateway (port 8080). This was resolved by configuring a `CorsWebFilter` in the API Gateway that explicitly allows the frontend origin, required headers, and HTTP methods.

**RabbitMQ Connection Timing**
When starting services via Docker Compose, the Payment Service and Notification Service would attempt to connect to RabbitMQ before the broker had fully started. Although Docker Compose `depends_on` was used, it does not wait for the service to be *ready* — only *started*. This was addressed by adding a Spring AMQP retry policy with exponential backoff in `application.yml`.

**Database-per-Service with Cross-Service Data**
Displaying a user's full booking history on the Profile page required aggregating data from Flight, Hotel, and Package services separately. Since a single SQL JOIN across schemas is not possible, the frontend makes three parallel API calls and merges the results client-side. While this works well at the current scale, it highlighted the trade-off of distributed data ownership.

**Kubernetes Pod Startup Order**
The Eureka Service Registry must be fully running before other services attempt to register. Kubernetes does not guarantee startup order between pods. This was handled by configuring a `readinessProbe` on the service-registry pod and using `initContainers` on dependent services to poll the Eureka health endpoint before starting.

---

## 5. Lessons Learned

**Microservices add upfront complexity but pay off at scale.** Designing service boundaries, managing inter-service communication, and operating multiple databases required significantly more initial setup than a monolithic approach. However, the ability to scale the Flight Service independently during peak booking periods — without touching the User or Notification service — demonstrated the real value of this architecture.

**Asynchronous messaging improves resilience.** Decoupling the Payment Service from the Notification Service via RabbitMQ meant that email failures (SMTP outages, network delays) had zero impact on payment processing. This pattern should be applied whenever a business operation has a downstream side-effect that does not need to block the primary response.

**Infrastructure as Code is essential for reproducibility.** Writing Kubernetes manifests and Docker Compose files from the beginning made environment setup repeatable for all team members. Manual server configuration would have made onboarding, testing, and cloud deployment error-prone and time-consuming.

**Health probes and autoscaling are non-negotiable in production.** Early deployments without proper readiness probes caused Kubernetes to route traffic to pods that were still initializing, resulting in connection-refused errors. Adding `/actuator/health` probes eliminated this entirely, and observing the HPA automatically scale pods under load illustrated the practical value of cloud elasticity.

**Secrets must never live in code.** Embedding database credentials in `application.yml` during early development led to accidental exposure in version control. Moving all secrets to OCI Vault with Kubernetes Secrets injection required a refactor mid-project. This reinforced the principle that secrets management strategy must be defined at the start of a project, not retrofitted later.

**Docker Compose is invaluable for local development.** Being able to spin up the entire 10-container stack with a single command (`docker-compose up`) enabled rapid iteration and consistent behavior across all team members' machines, eliminating "works on my machine" issues before they could slow down integration work.

---

*Document prepared for EC7205 Cloud Computing — Assignment 2, University of Ruhuna, Faculty of Engineering.*
*Maximum length: 5–6 pages (as per submission guidelines).*