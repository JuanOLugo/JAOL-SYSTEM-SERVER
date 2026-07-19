import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsUUID('4', {
    message: 'El identificador del usuario no tiene un formato válido.',
  })
  id: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(4, 50)
  username?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @Length(5, 150)
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @Length(7, 30)
  @Matches(/^[0-9()+\-\s]+$/)
  phone?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado del usuario debe ser verdadero o falso.',
  })
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  roleIds?: string[];
}