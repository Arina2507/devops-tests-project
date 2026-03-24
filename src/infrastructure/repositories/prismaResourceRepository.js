const ResourceRepository = require("../../application/repositories/resourceRepository");

class PrismaResourceRepository extends ResourceRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.resource.findUnique({ where: { id } });
  }

  async list() {
    return this.prisma.resource.findMany({ orderBy: { name: "asc" } });
  }

  async create(data) {
    return this.prisma.resource.create({ data });
  }
}

module.exports = PrismaResourceRepository;