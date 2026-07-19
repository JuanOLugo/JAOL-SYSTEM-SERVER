import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID('4', {
    message: 'El identificador de la compañía no tiene un formato válido.',
  })
  companyId: string;

  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre de usuario debe ser un texto.',
  })
  @Length(4, 50, {
    message: 'El nombre de usuario debe tener entre 4 y 50 caracteres.',
  })
  username: string;

  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre debe ser un texto.',
  })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres.',
  })
  firstName: string;

  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El apellido debe ser un texto.',
  })
  @Length(2, 100, {
    message: 'El apellido debe tener entre 2 y 100 caracteres.',
  })
  lastName: string;

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
  @Length(7, 30, {
    message: 'El teléfono debe tener entre 7 y 30 caracteres.',
  })
  @Matches(/^[0-9()+\-\s]+$/, {
    message:
      'El teléfono solo puede contener números, espacios, paréntesis, + y guiones.',
  })
  phone?: string;

  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'La contraseña debe ser un texto.',
  })
  @Length(8, 100, {
    message: 'La contraseña debe tener entre 8 y 100 caracteres.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-+=])[A-Za-z\d@$!%*?&.#_\-+=]+$/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
  })
  password: string;

  @IsArray({
    message: 'Los roles deben enviarse en un arreglo.',
  })
  @ArrayUnique({
    message: 'No se pueden repetir roles.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Uno o más identificadores de roles no son válidos.',
  })
  roleIds: string[];
}