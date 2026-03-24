class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    this.ensureStartTimeIsNotInPast(input.startAt);
    this.ensureValidTimeRange(input.startAt, input.endAt);

    return input;
  }

  ensureStartTimeIsNotInPast(startAtValue) {
    const startAt = new Date(startAtValue);
    const currentTime = this.now();

    if (startAt < currentTime) {
      throw new Error("Start time is in the past");
    }
  }

  ensureValidTimeRange(startAtValue, endAtValue) {
    const startAt = new Date(startAtValue);
    const endAt = new Date(endAtValue);

    if (endAt <= startAt) {
      throw new Error("End time must be after start time");
    }
  }
}

module.exports = ReservationService;