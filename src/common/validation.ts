import {
  applyDecorators,
  BadRequestException,
  ValidationPipe,
  type ValidationError,
} from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsISO8601, IsRFC3339 } from "class-validator";

// Postgres `integer` upper bound; larger values would fail at the database.
export const INT4_MAX = 2147483647;

// RFC 3339 date-time with a mandatory offset (2026-11-01T20:00:00Z) that is
// also a real calendar date: IsRFC3339 alone accepts 2026-02-30T00:00:00Z.
export function IsDateTime() {
  const message = "$property must be an RFC 3339 date-time";
  return applyDecorators(
    IsRFC3339({ message }),
    IsISO8601({ strict: true }, { message }),
  );
}

// Optional query params are often sent blank (`?name=`) by a cleared search
// box. Trims them and treats a blank value as absent so validation skips it.
export function BlankToUndefined() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== "string") {
      return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  });
}

// Keeps `message` a single string, like every other error response, with one
// entry per property: the topmost failing decorator, so `@IsInt() @Min(1)`
// reports a type error before a range error. class-validator runs a
// property's decorators bottom-up, which makes that the last constraint.
function toBadRequest(errors: ValidationError[]) {
  const messages = errors.flatMap(({ constraints = {} }) =>
    Object.values(constraints).slice(-1),
  );
  return new BadRequestException(messages.join(", "));
}

export const validationPipe = new ValidationPipe({
  // Strip properties that have no validation decorator.
  whitelist: true,
  // Hand DTO instances to controllers, so @Type() conversions and defaults apply.
  transform: true,
  exceptionFactory: toBadRequest,
});
