import { Injectable } from "@nestjs/common";
import type { Pagination } from "../common/pagination.js";
import type { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface EventFilters extends Pagination {
  search?: string | undefined;
  name?: string | undefined;
  code?: string | undefined;
  startDateFrom?: Date | undefined;
  startDateTo?: Date | undefined;
  endDateFrom?: Date | undefined;
  endDateTo?: Date | undefined;
}

function dateRange(gte?: Date, lte?: Date) {
  return gte || lte ? { gte, lte } : undefined;
}

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EventUncheckedCreateInput) {
    return this.prisma.event.create({ data });
  }

  findAll({
    search,
    name,
    code,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    limit,
    offset,
  }: EventFilters) {
    const where: Prisma.EventWhereInput = {
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      name: name ? { contains: name, mode: "insensitive" } : undefined,
      code: code ? { contains: code, mode: "insensitive" } : undefined,
      startDate: dateRange(startDateFrom, startDateTo),
      endDate: dateRange(endDateFrom, endDateTo),
    };

    return this.prisma.event.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: limit,
      skip: offset,
    });
  }

  findById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  findByCode(code: string) {
    return this.prisma.event.findFirst({ where: { code } });
  }

  update(id: string, data: Prisma.EventUncheckedUpdateInput) {
    return this.prisma.event.update({ where: { id }, data });
  }

  // Removes the event together with its ticket types, atomically.
  deleteWithTickets(id: string) {
    return this.prisma.$transaction([
      this.prisma.eventTicket.deleteMany({ where: { eventId: id } }),
      this.prisma.event.delete({ where: { id } }),
    ]);
  }
}
