import { Module } from '@nestjs/common';
import { WebmodulesService } from './webmodules.service';
import { WebmodulesController } from './webmodules.controller';

@Module({
  controllers: [WebmodulesController],
  providers: [WebmodulesService],
})
export class WebmodulesModule {}
