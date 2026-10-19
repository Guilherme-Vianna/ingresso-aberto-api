import { Injectable } from "@nestjs/common";
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "../common/errors.js";
import { type EventFilters, EventRepository } from "./event.repository.js";

export interface CreateEventInput {
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
}

export type UpdateEventInput = Partial<CreateEventInput>;

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(input: CreateEventInput, userEmail: string) {
    this.assertValidPeriod(input.startDate, input.endDate);
    await this.assertCodeAvailable(input.code);
    return this.eventRepository.create({
      ...input,
      createdBy: userEmail,
      updatedBy: userEmail,
    });
  }

  list(filters: EventFilters) {
    this.assertValidRange(
      "startDate",
      filters.startDateFrom,
      filters.startDateTo,
    );
    this.assertValidRange("endDate", filters.endDateFrom, filters.endDateTo);
    return this.eventRepository.findAll(filters);
  }

  async getById(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundError("Event not found");
    }
    return event;
  }

  async update(id: string, input: UpdateEventInput, userEmail: string) {
    const current = await this.getById(id);

    if (input.startDate || input.endDate) {
      this.assertValidPeriod(
        input.startDate ?? current.startDate,
        input.endDate ?? current.endDate,
      );
    }
    if (input.code !== undefined && input.code !== current.code) {
      await this.assertCodeAvailable(input.code, id);
    }

    return this.eventRepository.update(id, {
      ...input,
      updatedBy: userEmail,
    });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.eventRepository.deleteWithTickets(id);
  }

  private assertValidPeriod(startDate: Date, endDate: Date) {
    if (endDate.getTime() <= startDate.getTime()) {
      throw new BusinessRuleError("endDate must be after startDate");
    }
  }

  private assertValidRange(field: string, from?: Date, to?: Date) {
    if (from && to && from.getTime() > to.getTime()) {
      throw new BusinessRuleError(
        `${field}From must be before or equal to ${field}To`,
      );
    }
  }

  private async assertCodeAvailable(code: string, ignoreId?: string) {
    const existing = await this.eventRepository.findByCode(code);
    if (existing && existing.id !== ignoreId) {
      throw new ConflictError(`Event code "${code}" is already in use`);
    }
  }
}
