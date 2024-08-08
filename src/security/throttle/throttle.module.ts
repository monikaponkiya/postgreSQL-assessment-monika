import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<ThrottlerModuleOptions> => {
        const options: ThrottlerModuleOptions = {
          throttlers: [
            {
              ttl: configService.get<number>('express.throttler.ttlTime'),
              limit: configService.get<number>(
                'express.throttler.requestCount',
              ),
            },
          ],
        };
        return options;
      },
    }),
  ],
})
export class ThrottleModule {}
