import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './queue/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TODO(deploy): CORS_ORIGIN defaults to '*' (any origin) which is fine for
  // a demo deploy but should be locked down to the real patient-facing
  // origin(s) before this ever carries real patient data — see CLAUDE.md's
  // data-protection guardrails.
  const corsOrigin = process.env.CORS_ORIGIN ?? '*';
  app.enableCors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not set (see .env.example)');
  }
  const redisIoAdapter = new RedisIoAdapter(app, redisUrl);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.PORT ?? 3000;
  // Explicit 0.0.0.0: required for the container to be reachable from
  // outside itself on Render/Docker (some Node/Docker combinations default
  // loopback-only when no host is given).
  await app.listen(port, '0.0.0.0');
}

bootstrap();
