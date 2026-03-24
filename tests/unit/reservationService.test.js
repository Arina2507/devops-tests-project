const ReservationService = require("../../src/application/services/reservationService");

describe("ReservationService", () => {
  it("rejects past reservation", async () => {
    const now = new Date("2026-03-24T12:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T11:00:00Z";

    const reservationRepository = {
      findByIdempotencyKey: jest.fn(),
      findActiveByUserId: jest.fn(),
      findOverlappingForResource: jest.fn(),
      create: jest.fn()
    };

    const resourceRepository = {
      findById: jest.fn()
    };

    const userRepository = {
      findById: jest.fn()
    };

    const service = new ReservationService({
      reservationRepository,
      resourceRepository,
      userRepository,
      now: () => now
    });

    await expect(
      service.createReservation({
        userId: "user-1",
        resourceId: "resource-1",
        startAt,
        endAt
      })
    ).rejects.toThrow("Start time is in the past");
  });

  it("rejects invalid time range", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T10:00:00Z";

    const reservationRepository = {
      findByIdempotencyKey: jest.fn(),
      findActiveByUserId: jest.fn(),
      findOverlappingForResource: jest.fn(),
      create: jest.fn()
    };

    const resourceRepository = {
      findById: jest.fn()
    };

    const userRepository = {
      findById: jest.fn()
    };

    const service = new ReservationService({
      reservationRepository,
      resourceRepository,
      userRepository,
      now: () => now
    });

    await expect(
      service.createReservation({
        userId: "user-1",
        resourceId: "resource-1",
        startAt,
        endAt
      })
    ).rejects.toThrow("End time must be after start time");
  });

  it("rejects overlapping reservation", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T11:00:00Z";

    const reservationRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findActiveByUserId: jest.fn().mockResolvedValue([]),
      findOverlappingForResource: jest.fn().mockResolvedValue([{ id: "existing-1" }]),
      create: jest.fn()
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
      now: () => now
    });

    await expect(
      service.createReservation({
        userId: "user-1",
        resourceId: "resource-1",
        startAt,
        endAt
      })
    ).rejects.toThrow("Resource is already reserved for this time");
  });

  it("rejects reservation when user already has too many active reservations", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T11:00:00Z";

    const reservationRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findActiveByUserId: jest.fn().mockResolvedValue([
        { id: "reservation-1" },
        { id: "reservation-2" },
        { id: "reservation-3" }
      ]),
      findOverlappingForResource: jest.fn().mockResolvedValue([]),
      create: jest.fn()
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
      now: () => now
    });

    await expect(
      service.createReservation({
        userId: "user-1",
        resourceId: "resource-1",
        startAt,
        endAt
      })
    ).rejects.toThrow("User has reached the active reservation limit");
  });

  it("returns existing reservation for repeated idempotency key", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T11:00:00Z";
    const existingReservation = {
      id: "reservation-1",
      userId: "user-1",
      resourceId: "resource-1",
      startAt,
      endAt,
      idempotencyKey: "idem-1"
    };

    const reservationRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(existingReservation),
      findActiveByUserId: jest.fn(),
      findOverlappingForResource: jest.fn(),
      create: jest.fn()
    };

    const resourceRepository = {
      findById: jest.fn()
    };

    const userRepository = {
      findById: jest.fn()
    };

    const service = new ReservationService({
      reservationRepository,
      resourceRepository,
      userRepository,
      now: () => now
    });

    const result = await service.createReservation({
      userId: "user-1",
      resourceId: "resource-1",
      startAt,
      endAt,
      idempotencyKey: "idem-1"
    });

    expect(result).toEqual(existingReservation);
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it("rejects reservation outside resource working hours", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T08:30:00Z";
    const endAt = "2026-03-24T09:30:00Z";

    const reservationRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      findActiveByUserId: jest.fn().mockResolvedValue([]),
      findOverlappingForResource: jest.fn().mockResolvedValue([]),
      create: jest.fn()
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
      now: () => now
    });

    await expect(
      service.createReservation({
        userId: "user-1",
        resourceId: "resource-1",
        startAt,
        endAt
      })
    ).rejects.toThrow("Reservation is outside working hours");
  });

  it("creates reservation when input is valid", async () => {
    const now = new Date("2026-03-24T08:00:00Z");
    const startAt = "2026-03-24T10:00:00Z";
    const endAt = "2026-03-24T11:00:00Z";
    const createdReservation = {
      id: "reservation-1",
      userId: "user-1",
      resourceId: "resource-1",
      startAt,
      endAt,
      status: "PENDING"
    };

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
      now: () => now
    });

    const result = await service.createReservation({
      userId: "user-1",
      resourceId: "resource-1",
      startAt,
      endAt
    });

    expect(result).toEqual(createdReservation);
    expect(reservationRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      resourceId: "resource-1",
      startAt: new Date(startAt),
      endAt: new Date(endAt)
    });
  });
});