import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ logger: true }),
);

// Interactive docs at /docs, raw OpenAPI document at /docs-json.
SwaggerModule.setup(
  "docs",
  app,
  SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("Ingresso Aberto API")
      .setDescription("API assíncrona para compra de ingressos")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build(),
  ),
);

// Runs onModuleDestroy (Prisma disconnect) on SIGINT/SIGTERM.
app.enableShutdownHooks();

await app.listen(Number(app.get(ConfigService).get("PORT")) || 3000);
