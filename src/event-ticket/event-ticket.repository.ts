import { Injectable } from "@nestjs/common";
import type { Pagination } from "../common/pagination.js";
import type { Prisma } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

export interface EventTicketFilters extends Pagination {
  eventId?: string | undefined;
}

@Injectable()
export class EventTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EventTicketUncheckedCreateInput) {
    return this.prisma.eventTicket.create({ data });
  }

  findAll({ eventId, limit, offset }: EventTicketFilters) {
    return this.prisma.eventTicket.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit,
      skip: offset,
    });
  }

  findById(id: string) {
    return this.prisma.eventTicket.findUnique({ where: { id } });
  }

  findByEventAndCode(eventId: string | null, code: string) {
    return this.prisma.eventTicket.findFirst({ where: { eventId, code } });
  }

  update(id: string, data: Prisma.EventTicketUncheckedUpdateInput) {
    return this.prisma.eventTicket.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.eventTicket.delete({ where: { id } });
  }
}
