import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUserEmail } from "../auth/current-user.decorator.js";
import { NonEmptyBodyPipe } from "../common/non-empty-body.pipe.js";
import {
  CreateEventTicketDto,
  ListEventTicketsQueryDto,
  UpdateEventTicketDto,
} from "./event-ticket.dto.js";
import { EventTicketService } from "./event-ticket.service.js";

@ApiTags("event-tickets")
@ApiBearerAuth()
@Controller("event-tickets")
export class EventTicketController {
  constructor(private readonly eventTicketService: EventTicketService) {}

  @Post()
  @ApiOperation({ summary: "Cria ingresso" })
  create(
    @Body() body: CreateEventTicketDto,
    @CurrentUserEmail() email: string,
  ) {
    return this.eventTicketService.create(body, email);
  }

  @Get()
  @ApiOperation({ summary: "Lista ingressos" })
  list(@Query() query: ListEventTicketsQueryDto) {
    return this.eventTicketService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca ingresso por id" })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventTicketService.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza ingresso" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(NonEmptyBodyPipe) body: UpdateEventTicketDto,
    @CurrentUserEmail() email: string,
  ) {
    return this.eventTicketService.update(id, body, email);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove ingresso" })
  @ApiNoContentResponse()
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventTicketService.remove(id);
  }
}
