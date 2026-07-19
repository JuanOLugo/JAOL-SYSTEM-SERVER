import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyUtilsService } from './company-utils.service';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, QueryFailedError, Repository } from 'typeorm';
import { DefaultReturnRestapi } from 'src/utils/interfaces/return-restapi';
import { isUUID } from 'class-validator';
import { GetCompaniesDto } from './dto/any-company.dto';
import { User } from '../user/entities/user.entity';
import { UserUtilService } from '../user/user-util.service';
import { combineAll } from 'rxjs';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyUtilsService: CompanyUtilsService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    private readonly userUtilService: UserUtilService,
  ) { }

  async create(
    dto: CreateCompanyDto,
  ): Promise<DefaultReturnRestapi<Partial<Company>>> {
    const { name, description, location, email, phone } = dto;

    const companyCode = this.companyUtilsService.generateCompanyCode(name);

    /**
     * Verificar si ya existe una compañía con el mismo correo.
     */
    const companyByEmail = await this.companyRepository.exists({
      where: {
        email,
      },
    });

    if (companyByEmail) {
      throw new ConflictException(
        'Ya existe una compañía registrada con ese correo electrónico.',
      );
    }

    /**
     * Verificar que el código generado no exista.
     */
    const companyByCode = await this.companyRepository.exists({
      where: {
        code: companyCode,
      },
    });

    if (companyByCode) {
      throw new ConflictException(
        'No fue posible generar un código único para la compañía. Intente nuevamente.',
      );
    }

    const company = this.companyRepository.create({
      code: companyCode,
      name,
      description,
      location,
      email,
      phone,
    });

    /**
     * Crear usuario para la compañía.
     */

    /**
     * Guardar la compañía.
     */
    try {
      const savedCompany = await this.companyRepository.save(company);
      /**
       * Crear usuario para la compañía.
       */
      return {
        message: 'Compañía registrada exitosamente.',
        data: {
          code: savedCompany.code,
          name: savedCompany.name,
          id: savedCompany.id,
        },
      };
    } catch (error) {
      Logger.error(error, CompanyService.name);

      /**
       * Errores provenientes de PostgreSQL.
       */
      if (error instanceof QueryFailedError) {
        const pgError = error as QueryFailedError & {
          driverError: {
            code: string;
            constraint?: string;
          };
        };

        switch (pgError.driverError.code) {
          /**
           * Violación de UNIQUE.
           */
          case '23505': {
            switch (pgError.driverError.constraint) {
              case 'UQ_company_code':
                throw new ConflictException(
                  'El código de la compañía ya existe.',
                );

              case 'UQ_company_email':
                throw new ConflictException(
                  'El correo electrónico ya se encuentra registrado.',
                );

              default:
                throw new ConflictException(
                  'Ya existe una compañía con la misma información.',
                );
            }
          }

          /**
           * Valor nulo.
           */
          case '23502':
            throw new BadRequestException(
              'Faltan datos obligatorios para registrar la compañía.',
            );

          /**
           * Longitud excedida.
           */
          case '22001':
            throw new BadRequestException(
              'Uno de los campos supera la longitud permitida.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al registrar la compañía.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al registrar la compañía.',
      );
    }
  }

  async getCompanyById(id: string): Promise<DefaultReturnRestapi<Company>> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    try {
      const company = await this.companyRepository.findOne({
        where: {
          id,
        },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          location: true,
          email: true,
          phone: true,

          users: {
            id: true,
            code: true,
            firstName: true,
            lastName: true,
          },
        },
        relations: {
          users: true,
        },
      });

      if (!company) {
        throw new NotFoundException(
          'No se encontró ninguna compañía con el identificador proporcionado.',
        );
      }

      return {
        data: company,
        message: 'Compañía obtenida correctamente.',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof RequestTimeoutException ||
        error instanceof GatewayTimeoutException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      /**
       * Errores provenientes de PostgreSQL / TypeORM.
       */
      if (error instanceof QueryFailedError) {
        Logger.error(
          `Error SQL al consultar la compañía ${id}`,
          error.stack,
          CompanyService.name,
        );

        throw new InternalServerErrorException(
          'Ocurrió un error al consultar la información de la compañía.',
        );
      }

      /**
       * Error inesperado.
       */
      Logger.error(
        `Error inesperado al consultar la compañía ${id}`,
        error instanceof Error ? error.stack : String(error),
        CompanyService.name,
      );

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado. Intente nuevamente o contacte al administrador.',
      );
    }
  }

  async getCompanies(filters: GetCompaniesDto): Promise<
    DefaultReturnRestapi<{
      companies: Company[];
      total: number;
    }>
  > {
    const { page = 1, limit = 20, filter } = filters;
    const { code, name } = filter || {};

    try {
      const query = this.companyRepository
        .createQueryBuilder('company')
        .select([
          'company.id',
          'company.code',
          'company.name',
          'company.description',
          'company.isActive',
        ]);

      if (name) {
        query.andWhere('LOWER(company.name) LIKE LOWER(:name)', {
          name: `%${name.trim()}%`,
        });
      }

      if (code) {
        query.andWhere('LOWER(company.code) LIKE LOWER(:code)', {
          code: `%${code.trim()}%`,
        });
      }

      query
        .orderBy('company.name', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [companies, total] = await query.getManyAndCount();

      return {
        data: {
          companies,
          total,
        },
        message: 'Compañías obtenidas correctamente.',
      };
    } catch (error) {
      Logger.error(
        'Error consultando compañías.',
        error instanceof Error ? error.stack : String(error),
        CompanyService.name,
      );

      throw new InternalServerErrorException(
        'No fue posible obtener el listado de compañías.',
      );
    }
  }

  async updateCompany(
    dto: UpdateCompanyDto,
  ): Promise<DefaultReturnRestapi<Partial<Company>>> {
    const { id, name, description, location, email, phone, isActive } = dto;

    if (!isUUID(id)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          location: true,
          email: true,
          phone: true,
          isActive: true,
        },
      });

      if (!company) {
        throw new NotFoundException(
          'No se encontró ninguna compañía con el identificador proporcionado.',
        );
      }

      /**
       * Verificar correo duplicado.
       */
      if (email && email !== company.email) {
        const emailExists = await this.companyRepository.exists({
          where: {
            email,
          },
        });

        if (emailExists) {
          throw new ConflictException(
            'Ya existe otra compañía registrada con ese correo electrónico.',
          );
        }
      }

      company.name = name?.trim() ?? company.name;
      company.description = description?.trim() ?? company.description;
      company.location = location?.trim() ?? company.location;
      company.email = email?.trim().toLowerCase() ?? company.email;
      company.phone = phone?.trim() ?? company.phone;
      company.isActive = isActive ?? company.isActive;

      const result = await this.companyRepository.save(company);

      return {
        data: {
          id: result.id,
          code: result.code,
          name: result.name,
          description: result.description,
          location: result.location,
          email: result.email,
          phone: result.phone,
          isActive: result.isActive,
        },
        message: 'La compañía fue actualizada correctamente.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error actualizando la compañía ${id}`,
        error instanceof Error ? error.stack : String(error),
        CompanyService.name,
      );

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Ocurrió un error al actualizar la compañía.',
        );
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al actualizar la compañía.',
      );
    }
  }

  async deleteCompany(
    companyId: string,
  ): Promise<DefaultReturnRestapi<null>> {
    if (!isUUID(companyId)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    const existCompany = await this.companyRepository.findOne({
      where: {
        id: companyId,
      },
    });

    if (!existCompany) {
      throw new NotFoundException(
        'No se encontró ninguna compañía con el identificador proporcionado.',
      );
    }

    try {
      await this.companyRepository.remove(existCompany);

      return {
        data: null,
        message: 'La compañía fue eliminada correctamente.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error eliminando la compañía ${companyId}.`,
        error instanceof Error ? error.stack : String(error),
        CompanyService.name,
      );

      if (error instanceof QueryFailedError) {
        switch (error.driverError?.code) {
          /**
           * Violación de llave foránea.
           */
          case '23503':
            throw new ConflictException(
              'No es posible eliminar la compañía porque tiene información relacionada, como usuarios, roles u otros registros.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al eliminar la compañía.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al eliminar la compañía.',
      );
    }
  }
}
