const ReservationService = require("../../src/application/services/reservationService");

describe("ReservationService clock stub", () => {
  // Unit: injected clock
  it("uses injected clock stub for time checks", async () => {
    const fixedNow = new Date("2026-03-24T08:00:00Z");
    const createdReservation = { id: "reservation-1" };

    const reservationRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findActiveByUserId: jest.fn().mockResolvedValue([]),
      findOverlappingForResource: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue(createdReservation)
    };

    const resourceRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "resource-1",
        openHour: 9,
        closeHour: 18
      })
    };

    const userRepository = {
      findById: jest.fn().mockResolvedValue({ id: "user-1" })
    };

    const service = new ReservationService({
      reservationRepository,
      resourceRepository,
      userRepository,
      now: () => fixedNow
    });

    const result = await service.createReservation({
      userId: "user-1",
      resourceId: "resource-1",
      startAt: "2026-03-24T10:00:00Z",
      endAt: "2026-03-24T11:00:00Z"
    });

    expect(result).toEqual(createdReservation);
    expect(reservationRepository.create).toHaveBeenCalledTimes(1);
  });
});