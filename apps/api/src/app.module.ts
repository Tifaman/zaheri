import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HospitalGatewayModule } from './hospital-gateway/hospital-gateway.module';
import { AuthModule } from './auth/auth.module';
import { IntakeModule } from './intake/intake.module';
import { CasesModule } from './cases/cases.module';
import { QueueModule } from './queue/queue.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LabsModule } from './labs/labs.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        if (!url) {
          throw new Error('REDIS_URL is not set (see .env.example)');
        }
        const parsed = new URL(url);
        return {
          connection: {
            host: parsed.hostname,
            port: Number(parsed.port) || 6379,
            // Managed Redis (Render Key Value, Upstash, etc.) requires auth
            // and, for external providers, TLS — a bare {host, port} works
            // for a local unauthenticated dev Redis but silently fails auth
            // against anything real, so pull these from the URL when present.
            ...(parsed.password ? { password: parsed.password } : {}),
            ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
          },
        };
      },
    }),
    PrismaModule,
    RedisModule,
    HospitalGatewayModule,
    AuthModule,
    IntakeModule,
    CasesModule,
    QueueModule,
    NotificationsModule,
    LabsModule,
    ReceiptsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
