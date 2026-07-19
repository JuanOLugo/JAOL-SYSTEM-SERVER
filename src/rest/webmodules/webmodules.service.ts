import { Injectable } from '@nestjs/common';
import { CreateWebmoduleDto } from './dto/create-webmodule.dto';
import { UpdateWebmoduleDto } from './dto/update-webmodule.dto';

@Injectable()
export class WebmodulesService {
  create(createWebmoduleDto: CreateWebmoduleDto) {
    return 'This action adds a new webmodule';
  }

  findAll() {
    return `This action returns all webmodules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} webmodule`;
  }

  update(id: number, updateWebmoduleDto: UpdateWebmoduleDto) {
    return `This action updates a #${id} webmodule`;
  }

  remove(id: number) {
    return `This action removes a #${id} webmodule`;
  }
}
