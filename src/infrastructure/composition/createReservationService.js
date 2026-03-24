const ReservationService = require("../../application/services/reservationService");
const prisma = require("../database/prismaClient");
const PrismaReservationRepository = require("../repositories/prismaReservationRepository");
const PrismaResourceRepository = require("../repositories/prismaResourceRepository");
const PrismaUserRepository = require("../repositories/prismaUserRepository");

function createReservationService() {
  return new ReservationService({
    reservationRepository: new PrismaReservationRepository(prisma),
    resourceRepository: new PrismaResourceRepository(prisma),
    userRepository: new PrismaUserRepository(prisma)
  });
}

module.exports = createReservationService;