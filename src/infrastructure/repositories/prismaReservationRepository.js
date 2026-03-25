const { ReservationStatus } = require("@prisma/client");

const ReservationRepository = require("../../application/repositories/reservationRepository");

class PrismaReservationRepository extends ReservationRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true,
        resource: true
      }
    });
  }

  async findByIdempotencyKey(idempotencyKey) {
    if (!idempotencyKey) {
      return null;
    }

    return this.prisma.reservation.findUnique({
      where: { idempotencyKey }
    });
  }

  async findActiveByUserId(userId) {
    return this.prisma.reservation.findMany({
      where: {
        userId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]
        }
      },
      orderBy: { startAt: "asc" }
    });
  }

  async findOverlappingForResource(resourceId, startAt, endAt) {
    return this.prisma.reservation.findMany({
      where: {
        resourceId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]
        },
        startAt: {
          lt: endAt
        },
        endAt: {
          gt: startAt
        }
      },
      orderBy: { startAt: "asc" }
    });
  }

  async create(data) {
    return this.prisma.reservation.create({
      data,
      include: {
        user: true,
        resource: true
      }
    });
  }

  async delete(id) {
    return this.prisma.reservation.delete({
      where: { id }
    });
  }

  async updateStatus(id, status) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        resource: true
      }
    });
  }

  async list() {
    return this.prisma.reservation.findMany({
      include: {
        user: true,
        resource: true
      },
      orderBy: { startAt: "asc" }
    });
  }
}

module.exports = PrismaReservationRepository;