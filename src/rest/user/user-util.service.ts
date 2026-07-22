import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { randomUUID } from 'crypto';
import { PrivateUser } from './entities/private-user.entity';
import { Company } from '../company/entities/company.entity';
import { hashSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import envUtils from 'src/utils/env.utils';
@Injectable()
export class UserUtilService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async generateCompanyCode(
    companyId: string,
    userName: string,
  ): Promise<string> {
    const uuid = randomUUID().replace(/-/g, '').substring(0, 3).toUpperCase();

    return `USER-${companyId.toUpperCase().trim().slice(0, 3).toUpperCase()}-${userName.toUpperCase().trim().slice(0, 3)}-${uuid}`;
  }

  public async generateSupportUser(company: Company): Promise<User> {
    const supportUser = new User();

    supportUser.code = await this.generateCompanyCode(
      company.id,
      'SUPPORT-ADMIN',
    );
    supportUser.username = `support_${company.code.toLowerCase()}`;
    supportUser.email = `support_${company.code.toLowerCase()}@jaol.system`;
    supportUser.firstName = 'Support';
    supportUser.lastName = 'Jaol';
    supportUser.isActive = true;
    supportUser.company = company;

    const privateUserData = new PrivateUser();
    privateUserData.passwordHash = hashSync(
      envUtils.getEnv('DEFAULT_SUPPORT_PASSWORD'),
      12,
    );

    supportUser.privateUser = privateUserData;

    try {
      const exists = await this.userRepository.exists({
        where: [
          {
            username: supportUser.username,
          },
          {
            email: supportUser.email,
          },
        ],
      });

      if (exists) {
        throw new ConflictException(
          'Ya existe un usuario de soporte registrado para esta compañía.',
        );
      }

      await this.userRepository.save(supportUser);

      return supportUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error creando el usuario de soporte para la compañía ${company.id}.`,
        error instanceof Error ? error.stack : String(error),
        'UserUtilService',
      );

      if (error instanceof QueryFailedError) {
        const driverError = error.driverError;

        switch (driverError?.code) {
          case '23505':
            throw new ConflictException(
              'Ya existe un usuario con la misma información.',
            );

          case '23503':
            throw new BadRequestException(
              'La compañía asociada no existe o no es válida.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al crear el usuario de soporte.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al crear el usuario de soporte.',
      );
    }
  }
}
