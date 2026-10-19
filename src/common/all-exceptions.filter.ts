import { STATUS_CODES } from "node:http";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "../generated/prisma/client.js";
import { BusinessRuleError, ConflictError, NotFoundError } from "./errors.js";

const DOMAIN_ERRORS = [
  [NotFoundError, HttpStatus.NOT_FOUND],
  [ConflictError, HttpStatus.CONFLICT],
  [BusinessRuleError, HttpStatus.UNPROCESSABLE_ENTITY],
] as const;

// Only reachable when a record changes between the service check and the write.
const PRISMA_ERRORS: Record<string, readonly [HttpStatus, string]> = {
  P2025: [HttpStatus.NOT_FOUND, "Record not found"],
  P2003: [HttpStatus.UNPROCESSABLE_ENTITY, "Referenced record does not exist"],
};

// Every error response has the same shape: { statusCode, error, message }.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const [statusCode, message] = this.resolve(
      exception,
      http.getRequest<FastifyRequest>(),
    );

    http
      .getResponse<FastifyReply>()
      .code(statusCode)
      .send({ statusCode, error: STATUS_CODES[statusCode], message });
  }

  private resolve(
    exception: unknown,
    request: FastifyRequest,
  ): readonly [number, string] {
    // Validation failures, unknown routes and errors Fastify raises itself
    // (malformed JSON, ...) all arrive here as HttpExceptions.
    if (exception instanceof HttpException) {
      return [exception.getStatus(), exception.message];
    }

    for (const [type, statusCode] of DOMAIN_ERRORS) {
      if (exception instanceof type) {
        return [statusCode, exception.message];
      }
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prisma = PRISMA_ERRORS[exception.code];
      if (prisma) {
        return prisma;
      }
    }

    request.log.error(exception);
    return [HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"];
  }
}
