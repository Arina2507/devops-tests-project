# Reservation System

Reservation System is a semester project for TDD and DevOps. The application manages bookings for shared resources such as meeting rooms and sports courts.

## Project Goal

The goal was to build one project that shows both sides of the course work:

- real business logic, not only CRUD
- test-driven development of the core rules
- database and API integration
- Docker and Docker Compose
- CI with GitHub Actions
- Kubernetes manifests
- a small frontend for demonstration

## Business Logic

The main business logic is implemented in `ReservationService`.

File:

- `src/application/services/reservationService.js`

The service checks the request before saving anything to the database.

### Implemented Rules

1. A reservation cannot start in the past.
2. `endAt` must be later than `startAt`.
3. One resource cannot be booked for overlapping time ranges.
4. One user can have at most 3 active reservations.
5. A reservation must fit inside the working hours of the selected resource.
6. The same `idempotencyKey` must not create a duplicate reservation.

### Why These Rules Matter

This project is not just about storing records in a table. The important part is that the system decides whether the reservation is allowed or not. That is why the service layer is the core of the application.

### Reservation Creation Flow

When a reservation is created, the backend does this:

1. checks whether the same `idempotencyKey` was already used
2. validates the time range
3. checks the resource working hours
4. checks the user active reservation limit
5. checks overlap with existing reservations
6. saves the reservation only if all rules pass

## Domain Model

Main entities:

- `User`
- `Resource`
- `Reservation`

Database model:

- `User` has name, email, role
- `Resource` has name, type, working hours and capacity
- `Reservation` connects a user and a resource with `startAt`, `endAt`, `status`, and `idempotencyKey`

Main schema file:

- `prisma/schema.prisma`

## Architecture

The project uses a simple layered structure.

```text
frontend/                React + Vite UI
src/
  application/           services and repository contracts
  infrastructure/        Prisma repositories and bootstrap scripts
  app.js                 Express routes and request validation
  server.js              application startup
tests/
  unit/
  integration/
prisma/
k8s/
```

### Layer Responsibilities

- `application/services` contains business rules
- `application/repositories` contains repository interfaces
- `infrastructure/repositories` contains Prisma implementations
- `app.js` contains HTTP routes and error mapping
- `server.js` starts the backend

This separation makes the business logic easier to test.

## Tech Stack

- Node.js
- Express
- Prisma
- PostgreSQL
- Jest
- Supertest
- React
- Vite
- Docker
- GitHub Actions
- Kubernetes

## API

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

### `GET /users`

Returns users for the frontend form.

### `GET /resources`

Returns resources for the frontend form.

### `GET /reservations`

Returns all reservations.

### `POST /reservations`

Creates a reservation.

Example body:

```json
{
  "userId": "user-1",
  "resourceId": "resource-1",
  "startAt": "2026-03-24T10:00:00Z",
  "endAt": "2026-03-24T11:00:00Z"
}
```

Response codes:

- `201` reservation created
- `400` invalid payload
- `409` business rule conflict

### `DELETE /reservations/:id`

Deletes a reservation.

## TDD And Tests

The core rules were implemented with TDD.

Approach:

1. write a failing test
2. add the minimum code needed
3. refactor without breaking behavior

### Unit Tests

Unit tests focus on `ReservationService`.

Examples:

- past reservation is rejected
- invalid time range is rejected
- overlapping reservation is rejected
- active reservation limit is enforced
- working hours are enforced
- idempotency works correctly

Files:

- `tests/unit/reservationService.test.js`
- `tests/unit/reservationService.clock.test.js`

### Integration Tests

Integration tests check the HTTP API behavior.

Examples:

- reservation is created successfully
- invalid payload returns `400`
- business conflicts return `409`
- reservations list returns `200`

File:

- `tests/integration/reservationApi.test.js`

### Run Tests

```bash
npm test
```

Unit only:

```bash
npm run test:unit
```

Integration only:

```bash
npm run test:integration
```

## Backend Local Run

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Start backend:

```bash
npm run dev
```

Seed demo data:

```bash
npm run db:seed-demo
```

## Frontend

The frontend is a small React + Vite application used for demonstration.

What it can do:

- load users and resources
- create a reservation
- show reservation list
- delete a reservation
- display backend errors in the UI

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start frontend:

```bash
npm run dev
```

Or from project root:

```bash
npm run dev:frontend
```

Frontend URL:

- `http://localhost:5173`

## Docker Compose

Run backend and database together:

```bash
docker compose up -d --build
```

Backend:

- `http://localhost:3001`
- `http://localhost:3001/health`

Database:

- `localhost:55433`

Stop containers:

```bash
docker compose down
```

## CI

GitHub Actions workflow file:

- `.github/workflows/ci.yml`

The workflow does this:

1. installs dependencies
2. generates Prisma client
3. runs backend tests
4. builds the Docker image

This verifies that the project can be tested and built automatically.

## Kubernetes

Kubernetes manifests are in `k8s/`.

Included resources:

- namespace
- configmap
- secret
- postgres deployment and service
- app deployment and service
- persistent volume claim

Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
```

Check resources:

```bash
kubectl get all -n reservation-system
```

Port forward backend:

```bash
kubectl port-forward service/reservation-app 3001:3000 -n reservation-system
```

## Current Result

At this point the project includes:

- working backend API
- real business rules in the service layer
- unit and integration tests
- Prisma + PostgreSQL
- Docker and Docker Compose
- GitHub Actions CI
- Kubernetes manifests
- working React frontend for demonstration