const request = require("supertest");

const createApp = require("../../src/app");

describe("Reservation API", () => {
  it("creates reservation", async () => {
    const createdReservation = {
      id: "reservation-1",
      userId: "user-1",
      resourceId: "resource-1",
      startAt: "2026-03-24T10:00:00Z",
      endAt: "2026-03-24T11:00:00Z",
      status: "PENDING"
    };

    const reservationService = {
      createReservation: jest.fn().mockResolvedValue(createdReservation)
    };

    const app = createApp({ reservationService });

    const response = await request(app)
      .post("/reservations")
      .send({
        userId: "user-1",
        resourceId: "resource-1",
        startAt: "2026-03-24T10:00:00Z",
        endAt: "2026-03-24T11:00:00Z"
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdReservation);
    expect(reservationService.createReservation).toHaveBeenCalledWith({
      userId: "user-1",
      resourceId: "resource-1",
      startAt: "2026-03-24T10:00:00Z",
      endAt: "2026-03-24T11:00:00Z"
    });
  });
});