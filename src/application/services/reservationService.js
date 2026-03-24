class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    this.validateReservationTime(input.startAt, input.endAt);
    await this.ensureNoOverlap(input.resourceId, input.startAt, input.endAt);

    return input;
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
}

module.exports = ReservationService;