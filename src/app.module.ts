import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtLibService } from './library/jwt-lib/jwt-lib.service';
import { JwtModule } from '@nestjs/jwt';
import envUtils from './utils/env.utils';
import { CacheModule } from '@nestjs/cache-manager';
import { redisConfig } from './library/redis/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './library/db/data-source';
import { CompanyModule } from './rest/company/company.module';
import { WebmodulesModule } from './rest/webmodules/webmodules.module';
import { CompanyUtilsService } from './rest/company/company-utils.service';;

@Module({
  imports: [
    JwtModule.register({
      secret: envUtils.getEnv('JWT_SECRET_KEY'),
      global: true,
      signOptions: { expiresIn: '12h' },
    }),
    CacheModule.registerAsync(redisConfig),
    TypeOrmModule.forRoot(AppDataSource.options),
    CompanyModule,
    WebmodulesModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtLibService, CompanyUtilsService],
})
export class AppModule {}
