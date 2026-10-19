import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest } from "./auth.guard.js";

// Email of the authenticated Firebase user, stored as createdBy / updatedBy.
export const CurrentUserEmail = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error(
        "CurrentUserEmail used on a route without FirebaseAuthGuard",
      );
    }
    return request.user.email;
  },
);
