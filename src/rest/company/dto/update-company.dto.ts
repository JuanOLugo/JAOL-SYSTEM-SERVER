import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  id: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre debe ser un texto.',
  })
  @Length(3, 150, {
    message: 'El nombre debe tener entre 3 y 150 caracteres.',
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
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'La ubicación debe ser un texto.',
  })
  @Length(3, 255, {
    message: 'La ubicación debe tener entre 3 y 255 caracteres.',
  })
  location?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido.',
    },
  )
  @Length(5, 150, {
    message: 'El correo electrónico no puede superar los 150 caracteres.',
  })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El teléfono debe ser un texto.',
  })
  @Length(7, 30, {
    message: 'El teléfono debe tener entre 7 y 30 caracteres.',
  })
  @Matches(/^[0-9()+\-\s]+$/, {
    message:
      'El teléfono solo puede contener números, espacios, paréntesis, + y guiones.',
  })
  phone?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado de la compañía debe ser verdadero o falso.',
  })
  isActive?: boolean;
}