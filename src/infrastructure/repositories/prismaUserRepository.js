const UserRepository = require("../../application/repositories/userRepository");

class PrismaUserRepository extends UserRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async list() {
    return this.prisma.user.findMany({ orderBy: { name: "asc" } });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data) {
    return this.prisma.user.create({ data });
  }
}

module.exports = PrismaUserRepository;