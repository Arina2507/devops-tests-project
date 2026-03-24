class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    this.validateReservationTime(input.startAt, input.endAt);

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
}

module.exports = ReservationService;