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
  CreateEventDto,
  ListEventsQueryDto,
  UpdateEventDto,
} from "./event.dto.js";
import type { EventFilters } from "./event.repository.js";
import {
  type CreateEventInput,
  EventService,
  type UpdateEventInput,
} from "./event.service.js";

function toCreateInput(body: CreateEventDto): CreateEventInput {
  return {
    ...body,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  };
}

function toUpdateInput({
  startDate,
  endDate,
  ...rest
}: UpdateEventDto): UpdateEventInput {
  return {
    ...rest,
    startDate: startDate === undefined ? undefined : new Date(startDate),
    endDate: endDate === undefined ? undefined : new Date(endDate),
  };
}

function toDate(value: string | undefined) {
  return value === undefined ? undefined : new Date(value);
}

function toFilters(query: ListEventsQueryDto): EventFilters {
  return {
    search: query.search,
    name: query.name,
    code: query.code,
    startDateFrom: toDate(query.startDateFrom),
    startDateTo: toDate(query.startDateTo),
    endDateFrom: toDate(query.endDateFrom),
    endDateTo: toDate(query.endDateTo),
    limit: query.limit,
    offset: query.offset,
  };
}

@ApiTags("events")
@ApiBearerAuth()
@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: "Cria evento" })
  create(@Body() body: CreateEventDto, @CurrentUserEmail() email: string) {
    return this.eventService.create(toCreateInput(body), email);
  }

  @Get()
  @ApiOperation({ summary: "Lista eventos" })
  list(@Query() query: ListEventsQueryDto) {
    return this.eventService.list(toFilters(query));
  }

  @Get(":id")
  @ApiOperation({ summary: "Busca evento por id" })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventService.getById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza evento" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(NonEmptyBodyPipe) body: UpdateEventDto,
    @CurrentUserEmail() email: string,
  ) {
    return this.eventService.update(id, toUpdateInput(body), email);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove evento" })
  @ApiNoContentResponse()
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventService.remove(id);
  }
}
