const cors = require("cors");
const express = require("express");
const { z } = require("zod");

const conflictMessages = new Set([
  "Start time is in the past",
  "End time must be after start time",
  "Resource is already reserved for this time",
  "User has reached the active reservation limit",
  "Reservation is outside working hours"
]);

const reservationInputSchema = z.object({
  userId: z.string().min(1),
  resourceId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  idempotencyKey: z.string().min(1).optional()
});

function getStatusCode(error) {
  if (error.message === "Invalid reservation payload") {
    return 400;
  }

  if (conflictMessages.has(error.message)) {
    return 409;
  }

  return 500;
}

function toReservationInput(body) {
  const result = reservationInputSchema.safeParse(body);

  if (!result.success) {
    throw new Error("Invalid reservation payload");
  }

  return result.data;
}

function createApp({ reservationService } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/users", async (request, response, next) => {
    try {
      const users = await reservationService.listUsers();

      response.status(200).json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/resources", async (request, response, next) => {
    try {
      const resources = await reservationService.listResources();

      response.status(200).json(resources);
    } catch (error) {
      next(error);
    }
  });

  app.get("/reservations", async (request, response, next) => {
    try {
      const reservations = await reservationService.listReservations();

      response.status(200).json(reservations);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/reservations/:id", async (request, response, next) => {
    try {
      await reservationService.deleteReservation(request.params.id);

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/reservations", async (request, response, next) => {
    try {
      const reservation = await reservationService.createReservation(
        toReservationInput(request.body)
      );

      response.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, request, response, next) => {
    const status = getStatusCode(error);

    response.status(status).json({ message: error.message });
  });

  return app;
}

module.exports = createApp;