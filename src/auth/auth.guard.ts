import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { FastifyRequest } from "fastify";

export interface AuthenticatedUser {
  email: string;
}

export type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};

// Verifies the Firebase ID token sent as `Authorization: Bearer <token>` and
// exposes the user's email on the request. Registered globally (APP_GUARD).
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly auth;

  constructor(config: ConfigService) {
    const projectId = config.getOrThrow<string>("FIREBASE_PROJECT_ID");
    const app =
      getApps()[0] ??
      initializeApp({
        projectId,
        // Only needed outside Google infra when a service account is configured;
        // verifying ID tokens itself requires just the project id.
        ...(process.env.GOOGLE_APPLICATION_CREDENTIALS
          ? { credential: applicationDefault() }
          : {}),
      });
    this.auth = getAuth(app);
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    let decoded;
    try {
      decoded = await this.auth.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // The email is the user's identity here, so it must be present and verified.
    if (!decoded.email || !decoded.email_verified) {
      throw new UnauthorizedException("A verified email is required");
    }

    request.user = { email: decoded.email.toLowerCase() };
    return true;
  }
}
