import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebmodulesService } from './webmodules.service';
import { CreateWebmoduleDto } from './dto/create-webmodule.dto';
import { UpdateWebmoduleDto } from './dto/update-webmodule.dto';

@Controller('webmodules')
export class WebmodulesController {
  constructor(private readonly webmodulesService: WebmodulesService) {}

  @Post()
  create(@Body() createWebmoduleDto: CreateWebmoduleDto) {
    return this.webmodulesService.create(createWebmoduleDto);
  }

  @Get()
  findAll() {
    return this.webmodulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webmodulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebmoduleDto: UpdateWebmoduleDto) {
    return this.webmodulesService.update(+id, updateWebmoduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webmodulesService.remove(+id);
  }
}
