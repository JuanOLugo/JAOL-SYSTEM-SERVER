import { PartialType } from '@nestjs/mapped-types';
import { CreateWebmoduleDto } from './create-webmodule.dto';

export class UpdateWebmoduleDto extends PartialType(CreateWebmoduleDto) {}
