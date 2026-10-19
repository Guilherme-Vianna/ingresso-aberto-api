import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";

// Update DTOs have only optional fields, so the ValidationPipe accepts bodies
// that would change nothing ({}, unknown fields only, JSON primitives/arrays).
// Runs after the global ValidationPipe, on the transformed DTO.
@Injectable()
export class NonEmptyBodyPipe implements PipeTransform {
  transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !(value instanceof metatype)) {
      throw new BadRequestException("body must be an object");
    }
    if (Object.values(value).every((field) => field === undefined)) {
      throw new BadRequestException("body must have at least one property");
    }
    return value;
  }
}
