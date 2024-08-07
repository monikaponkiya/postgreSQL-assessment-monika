import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AppConfiguration from './config/app.config';
import { DatabaseModule } from './provider/database/database.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './security/auth/auth.module';
import { JwtAuthGuard } from './security/guard/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TenantModule } from './tenant/tenant.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfiguration],
      ignoreEnvFile: false,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    TenantModule,
    ProductModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    JwtService,
  ],
})
export class AppModule {}
