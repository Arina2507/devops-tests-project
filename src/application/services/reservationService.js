class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    this.ensureStartTimeIsNotInPast(input.startAt);

    return input;
  }

  ensureStartTimeIsNotInPast(startAtValue) {
    const startAt = new Date(startAtValue);
    const currentTime = this.now();

    if (startAt < currentTime) {
      throw new Error("Start time is in the past");
    }
  }
}

module.exports = ReservationService;