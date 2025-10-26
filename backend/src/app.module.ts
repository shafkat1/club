import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

// Modules
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VenuesModule } from './modules/venues/venues.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { PresenceModule } from './modules/presence/presence.module';
import { GroupsModule } from './modules/groups/groups.module';

// Services
import { PrismaService } from './common/services/prisma.service';
import { RedisService } from './common/services/redis.service';
import { S3Service } from './common/services/s3.service';

// Guards & Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
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
    AuthModule,
    UsersModule,
    VenuesModule,
    OrdersModule,
    RedemptionsModule,
    PresenceModule,
    GroupsModule,
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
