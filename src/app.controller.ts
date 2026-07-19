import { Controller, Get, Logger, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request } from 'express';

@Controller()

export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('main-api')
  async indexApiView(@Req() req: Request) {
    const result = this.appService.root(req);
    return result;
  }

}
