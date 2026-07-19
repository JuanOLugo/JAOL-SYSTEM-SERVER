import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class UpdateRoleDto {
  @IsUUID('4', {
    message: 'El identificador del rol no tiene un formato válido.',
  })
  id: string;

  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  companyId: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre del rol debe ser un texto.',
  })
  @Length(3, 100, {
    message: 'El nombre del rol debe tener entre 3 y 100 caracteres.',
  })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'La descripción debe ser un texto.',
  })
  @Length(0, 1000, {
    message: 'La descripción no puede superar los 1000 caracteres.',
  })
  description?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado del rol debe ser verdadero o falso.',
  })
  isActive?: boolean;

  @IsOptional()
  @IsArray({
    message: 'Los permisos deben enviarse en un arreglo.',
  })
  @ArrayUnique({
    message: 'No se pueden repetir permisos.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Uno o más permisos enviados no son válidos.',
  })
  permissionIds?: string[];
}