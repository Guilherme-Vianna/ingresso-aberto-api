import { Injectable } from "@nestjs/common";
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "../common/errors.js";
import { EventRepository } from "../event/event.repository.js";
import {
  type EventTicketFilters,
  EventTicketRepository,
} from "./event-ticket.repository.js";

export interface CreateEventTicketInput {
  eventId: string;
  name: string;
  code: string;
  price: number;
  maxQuantity: number;
}

// eventId is not updatable: a ticket type stays with the event it was created for.
export type UpdateEventTicketInput = Partial<
  Omit<CreateEventTicketInput, "eventId">
>;

@Injectable()
export class EventTicketService {
  constructor(
    private readonly eventTicketRepository: EventTicketRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async create(input: CreateEventTicketInput, userEmail: string) {
    await this.assertEventExists(input.eventId);
    await this.assertCodeAvailable(input.eventId, input.code);
    return this.eventTicketRepository.create({
      ...input,
      createdBy: userEmail,
      updatedBy: userEmail,
    });
  }

  list(filters: EventTicketFilters) {
    return this.eventTicketRepository.findAll(filters);
  }

  async getById(id: string) {
    const ticket = await this.eventTicketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError("Event ticket not found");
    }
    return ticket;
  }

  async update(
    id: string,
    input: UpdateEventTicketInput,
    userEmail: string,
  ) {
    const current = await this.getById(id);

    if (input.code !== undefined && input.code !== current.code) {
      await this.assertCodeAvailable(current.eventId, input.code, id);
    }

    return this.eventTicketRepository.update(id, {
      ...input,
      updatedBy: userEmail,
    });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.eventTicketRepository.delete(id);
  }

  private async assertEventExists(eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new BusinessRuleError("Event not found");
    }
  }

  private async assertCodeAvailable(
    eventId: string | null,
    code: string,
    ignoreId?: string,
  ) {
    const existing = await this.eventTicketRepository.findByEventAndCode(
      eventId,
      code,
    );
    if (existing && existing.id !== ignoreId) {
      throw new ConflictError(
        `Ticket code "${code}" is already in use for this event`,
      );
    }
  }
}
