import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CompanyFilterDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El código debe ser un texto.',
  })
  @Length(1, 50, {
    message: 'El código debe tener entre 1 y 50 caracteres.',
  })
  code?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre debe ser un texto.',
  })
  @Length(1, 150, {
    message: 'El nombre debe tener entre 1 y 150 caracteres.',
  })
  name?: string;
}

export class GetCompaniesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'La página debe ser un número entero.',
  })
  @Min(1, {
    message: 'La página debe ser mayor o igual a 1.',
  })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El límite debe ser un número entero.',
  })
  @Min(1, {
    message: 'El límite debe ser mayor o igual a 1.',
  })
  @Max(100, {
    message: 'El límite máximo permitido es 100 registros.',
  })
  limit = 20;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyFilterDto)
  filter?: CompanyFilterDto;
}
