import { Module } from "@nestjs/common";
import { EventModule } from "../event/event.module.js";
import { EventTicketController } from "./event-ticket.controller.js";
import { EventTicketRepository } from "./event-ticket.repository.js";
import { EventTicketService } from "./event-ticket.service.js";

@Module({
  imports: [EventModule],
  controllers: [EventTicketController],
  providers: [EventTicketService, EventTicketRepository],
})
export class EventTicketModule {}
