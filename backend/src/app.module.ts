import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

// Modules
import { HealthModule } from './modules/health/health.module';
import { VenuesModule } from './modules/venues/venues.module';

// Services
import { PrismaService } from './common/services/prisma.service';
import { RedisService } from './common/services/redis.service';
import { S3Service } from './common/services/s3.service';

// Guards & Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '24h' },
    }),

    // Feature modules
    HealthModule,
    VenuesModule,
    // Auth, Users, Orders, Presence, Groups modules commented out due to compilation issues
    // These can be enabled after fixing type errors
  ],
  providers: [
    PrismaService,
    RedisService,
    S3Service,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
