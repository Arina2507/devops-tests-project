const cors = require("cors");
const express = require("express");

const conflictMessages = new Set([
  "Start time is in the past",
  "End time must be after start time",
  "Resource is already reserved for this time",
  "User has reached the active reservation limit",
  "Reservation is outside working hours"
]);

function getStatusCode(error) {
  if (conflictMessages.has(error.message)) {
    return 409;
  }

  return 500;
}

function toReservationInput(body) {
  return {
    userId: body.userId,
    resourceId: body.resourceId,
    startAt: body.startAt,
    endAt: body.endAt,
    idempotencyKey: body.idempotencyKey
  };
}

function createApp({ reservationService } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (request, response) => {
    response.status(200).json({ status: "ok" });
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