const MAX_ACTIVE_RESERVATIONS = 3;

class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    const existingReservation = await this.resolveExistingReservation(input);

    if (existingReservation !== null) {
      return existingReservation;
    }

    await this.validateReservationCreation(input);

    return input;
  }

  async resolveExistingReservation(input) {
    return this.findExistingByIdempotencyKey(input.idempotencyKey);
  }

  async findExistingByIdempotencyKey(idempotencyKey) {
    if (!idempotencyKey) {
      return null;
    }

    return this.reservationRepository.findByIdempotencyKey(idempotencyKey);
  }

  async validateReservationCreation(input) {
    this.validateReservationTime(input.startAt, input.endAt);
    await this.ensureWithinWorkingHours(input.resourceId, input.startAt, input.endAt);
    await this.ensureUserHasFreeReservationSlot(input.userId);
    await this.ensureNoOverlap(input.resourceId, input.startAt, input.endAt);
  }

  validateReservationTime(startAtValue, endAtValue) {
    const startAt = new Date(startAtValue);
    const endAt = new Date(endAtValue);
    const currentTime = this.now();

    if (startAt < currentTime) {
      throw new Error("Start time is in the past");
    }

    if (endAt <= startAt) {
      throw new Error("End time must be after start time");
    }
  }

  async ensureNoOverlap(resourceId, startAt, endAt) {
    const overlappingReservations = await this.reservationRepository.findOverlappingForResource(
      resourceId,
      new Date(startAt),
      new Date(endAt)
    );

    if (overlappingReservations.length > 0) {
      throw new Error("Resource is already reserved for this time");
    }
  }

  async ensureUserHasFreeReservationSlot(userId) {
    const activeReservations = await this.reservationRepository.findActiveByUserId(userId);

    if (activeReservations.length >= MAX_ACTIVE_RESERVATIONS) {
      throw new Error("User has reached the active reservation limit");
    }
  }

  async ensureWithinWorkingHours(resourceId, startAtValue, endAtValue) {
    const resource = await this.resourceRepository.findById(resourceId);
    const startAt = new Date(startAtValue);
    const endAt = new Date(endAtValue);
    const startHour = this.toUtcHourValue(startAt);
    const endHour = this.toUtcHourValue(endAt);

    if (startHour < resource.openHour || endHour > resource.closeHour) {
      throw new Error("Reservation is outside working hours");
    }
  }

  toUtcHourValue(date) {
    return date.getUTCHours() + date.getUTCMinutes() / 60;
  }
}

module.exports = ReservationService;