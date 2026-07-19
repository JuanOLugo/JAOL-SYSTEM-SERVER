import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
import { StatementResultingChanges } from 'node:sqlite';

export class UserFilterDto {
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString({
        message: 'El código debe ser un texto.',
    })
    @Length(1, 50)
    code?: string;

    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString({
        message: 'El nombre debe ser un texto.',
    })
    @Length(1, 200)
    name?: string;
}

export class GetUsersDto {
    @IsUUID('4', {
        message: 'El identificador de la compañía no tiene un formato válido.',
    })
    companyId: string;

    @Type(() => Number)
    @IsInt({
        message: 'La página debe ser un número entero.',
    })
    @Min(1, {
        message: 'La página debe ser mayor o igual a 1.',
    })
    page = 1;

    @Type(() => Number)
    @IsInt({
        message: 'El límite debe ser un número entero.',
    })
    @Min(1, {
        message: 'El límite debe ser mayor o igual a 1.',
    })
    @Max(100, {
        message: 'El límite no puede ser mayor a 100.',
    })
    limit = 20;

    @IsOptional()
    @ValidateNested()
    @Type(() => UserFilterDto)
    filter?: UserFilterDto;
}

export class RemoveUserDto {
    @Transform(({ value }) => value?.trim())
    @IsUUID('4', {
        message: 'El identificador del usuario no tiene un formato válido.',
    })
    id: string;

    @Transform(({ value }) => value?.trim())
    @IsUUID('4', {
        message: 'El identificador de la compañía no tiene un formato válido.',
    })
    companyId: string;
}