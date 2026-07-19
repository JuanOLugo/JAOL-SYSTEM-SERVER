import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoleFilterDto {
  @IsOptional()
  @IsString({
    message: 'El nombre del rol debe ser un texto.',
  })
  name?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({
    message: 'El estado del rol debe ser verdadero o falso.',
  })
  isActive?: boolean;
}

export class GetRolesDto {
  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  companyId: string;

  @Type(() => Number)
  @IsInt({
    message: 'La página debe ser un número entero.',
  })
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt({
    message: 'El límite debe ser un número entero.',
  })
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoleFilterDto)
  filter?: RoleFilterDto;
}


export class GetRoleByIdDto {
  @IsUUID('4', {
    message: 'El identificador del rol no tiene un formato válido.',
  })
  id: string;

  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  companyId: string;
}

export class DeleteRoleDto {
  @IsUUID('4', {
    message: 'El identificador del rol no tiene un formato válido.',
  })
  id: string;

  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  companyId: string;
}