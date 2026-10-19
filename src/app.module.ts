import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { FirebaseAuthGuard } from "./auth/auth.guard.js";
import { AllExceptionsFilter } from "./common/all-exceptions.filter.js";
import { validationPipe } from "./common/validation.js";
import { EventModule } from "./event/event.module.js";
import { EventTicketModule } from "./event-ticket/event-ticket.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EventModule,
    EventTicketModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    { provide: APP_PIPE, useValue: validationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
