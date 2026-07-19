import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateCompanyDto {

  @IsString({
    message: 'El nombre debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El nombre de la compañía es obligatorio.',
  })
  @Length(3, 150, {
    message: 'El nombre debe tener entre 3 y 150 caracteres.',
  })
  name: string;

  @IsOptional()
  @IsString({
    message: 'La descripción debe ser un texto.',
  })
  @Length(0, 1000, {
    message: 'La descripción no puede superar los 1000 caracteres.',
  })
  description?: string;

  @IsOptional()
  @IsString({
    message: 'La ubicación debe ser un texto.',
  })
  @Length(3, 255, {
    message: 'La ubicación debe tener entre 3 y 255 caracteres.',
  })
  location?: string;

  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido.',
    },
  )
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio.',
  })
  @Length(5, 150, {
    message: 'El correo electrónico no puede superar los 150 caracteres.',
  })
  email: string;

  @IsOptional()
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
}

