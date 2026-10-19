import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";
import { PaginationQueryDto } from "../common/pagination.js";
import { BlankToUndefined, IsDateTime } from "../common/validation.js";

export class CreateEventDto {
  @ApiProperty({ example: "Rock in Rio" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "RIR-2026" })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ format: "date-time", example: "2026-11-01T20:00:00Z" })
  @IsDateTime()
  startDate!: string;

  @ApiProperty({ format: "date-time", example: "2026-11-02T04:00:00Z" })
  @IsDateTime()
  endDate!: string;
}

// skipNullProperties: false skips validation only for undefined, so an
// explicit null is still rejected instead of reaching the database.
export class UpdateEventDto extends PartialType(CreateEventDto, {
  skipNullProperties: false,
}) {}

// All filters are optional and combine with AND. Date bounds are inclusive.
// A `+hh:mm` offset must be URL-encoded (`%2B`), or it reaches the server as a space.
export class ListEventsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      "Nome OU código contém o texto (sem diferenciar maiúsculas); combina com os demais filtros",
    example: "rock",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Nome contém o texto (sem diferenciar maiúsculas)",
    example: "rock",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Código contém o texto (sem diferenciar maiúsculas)",
    example: "RIR",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Eventos que começam a partir desta data",
    example: "2026-11-01T00:00:00Z",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsDateTime()
  startDateFrom?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Eventos que começam até esta data",
    example: "2026-11-30T23:59:59Z",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsDateTime()
  startDateTo?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Eventos que terminam a partir desta data",
    example: "2026-11-01T00:00:00Z",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsDateTime()
  endDateFrom?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Eventos que terminam até esta data",
    example: "2026-11-30T23:59:59Z",
  })
  @IsOptional()
  @BlankToUndefined()
  @IsDateTime()
  endDateTo?: string;
}
