import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { PaginationQueryDto } from "../common/pagination.js";
import { INT4_MAX } from "../common/validation.js";

export class CreateEventTicketDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  eventId!: string;

  @ApiProperty({ example: "Pista" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "PISTA" })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ minimum: 0, maximum: INT4_MAX, example: 15000 })
  @IsInt()
  @Min(0)
  @Max(INT4_MAX)
  price!: number;

  @ApiProperty({ minimum: 1, maximum: INT4_MAX, example: 100 })
  @IsInt()
  @Min(1)
  @Max(INT4_MAX)
  maxQuantity!: number;
}

// eventId is not updatable: a ticket type stays with the event it was created
// for. skipNullProperties: false still rejects an explicit null.
export class UpdateEventTicketDto extends PartialType(
  OmitType(CreateEventTicketDto, ["eventId"] as const),
  { skipNullProperties: false },
) {}

export class ListEventTicketsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  eventId?: string;
}
