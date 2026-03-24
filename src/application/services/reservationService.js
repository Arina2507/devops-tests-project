class ReservationService {
  constructor({ reservationRepository, resourceRepository, userRepository, now }) {
    this.reservationRepository = reservationRepository;
    this.resourceRepository = resourceRepository;
    this.userRepository = userRepository;
    this.now = now || (() => new Date());
  }

  async createReservation(input) {
    const startAt = new Date(input.startAt);
    const currentTime = this.now();

    if (startAt < currentTime) {
      throw new Error("Start time is in the past");
    }

    return input;
  }
}

module.exports = ReservationService;