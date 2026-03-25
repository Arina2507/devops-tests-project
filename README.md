# Reservation System

This is a semester project for TDD and DevOps. Users can reserve shared resources such as rooms or sports courts.

## Why this project

I wanted one project that shows both parts:

- business logic
- tests written step by step
- simple frontend for demo
- Docker and Docker Compose
- CI with GitHub Actions
- Kubernetes manifests

## Domain

Main entities:

- `User`
- `Resource`
- `Reservation`

Main rules:

1. reservation cannot start in the past
2. end time must be after start time
3. resource cannot be double-booked
4. user can have maximum 3 active reservations
5. reservation must be inside working hours
6. same `idempotencyKey` should not create duplicates

## Stack

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

## Structure

```text
src/
	application/
	infrastructure/
	app.js
	server.js
frontend/
 	src/
tests/
	unit/
	integration/
prisma/
k8s/
```

## API

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

### `GET /reservations`

Returns all reservations.

### `GET /users`

Returns users for the frontend form.

### `GET /resources`

Returns resources for the frontend form.

### `DELETE /reservations/:id`

Deletes a reservation.

### `POST /reservations`

Example body:

```json
{
	"userId": "user-1",
	"resourceId": "resource-1",
	"startAt": "2026-03-24T10:00:00Z",
	"endAt": "2026-03-24T11:00:00Z"
}
```

Responses:

- `201` created
- `400` invalid payload
- `409` business rule error

## Tests

I used TDD: first test, then code, then small refactoring.

Unit tests check the rules in `ReservationService`.

Integration tests check the API endpoints with Supertest.

Run all tests:

```bash
npm test
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

## Local run

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Start app:

```bash
npm run dev
```

Seed demo data:

```bash
npm run db:seed-demo
```

## Frontend

Install frontend dependencies:

```bash
cd frontend
npm install
```

Start frontend:

```bash
npm run dev
```

Or from the project root:

```bash
npm run dev:frontend
```

Frontend runs on:

- `http://localhost:5173`

## Docker Compose

Run app and database:

```bash
docker compose up -d --build
```

App:

- `http://localhost:3001`
- `http://localhost:3001/health`

Database:

- `localhost:55433`

Stop containers:

```bash
docker compose down
```

## CI

GitHub Actions workflow is in `.github/workflows/ci.yml`.

It does:

1. `npm ci`
2. `npm run prisma:generate`
3. `npm test`
4. `docker build`

## Kubernetes

Manifests are in `k8s/`.

They include:

- namespace
- configmap
- secret
- postgres deployment and service
- app deployment and service

Apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
```

Check:

```bash
kubectl get all -n reservation-system
```

Port forward app:

```bash
kubectl port-forward service/reservation-app 3001:3000 -n reservation-system
```

## How I can present it

I can show the project in this order:

1. explain the goal
2. show entities and business rules
3. show `ReservationService`
4. show unit and integration tests
5. show API routes in `src/app.js`
6. show the React frontend and create/delete reservation
7. show Dockerfile and `docker-compose.yml`
8. show GitHub Actions workflow
9. show Kubernetes manifests

## Current result

At this point the project has:

- working API
- working React frontend
- tested service logic
- unit and integration tests
- Docker setup
- GitHub Actions CI
- Kubernetes manifests