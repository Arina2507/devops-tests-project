const cors = require("cors");
const express = require("express");

function createApp({ reservationService } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.post("/reservations", async (request, response, next) => {
    try {
      const reservation = await reservationService.createReservation(request.body);

      response.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, request, response, next) => {
    response.status(500).json({ message: error.message });
  });

  return app;
}

module.exports = createApp;