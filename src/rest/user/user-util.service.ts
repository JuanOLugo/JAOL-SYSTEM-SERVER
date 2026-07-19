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
  ) { }

  public async generateUserCode(
    companyId: string,
    userName: string,
  ): Promise<string> {
    const uuid = randomUUID().replace(/-/g, '').substring(0, 3).toUpperCase();

    return `USER-${companyId.toUpperCase().trim().slice(0, 3).toUpperCase()}-${userName.toUpperCase().trim().slice(0, 3)}-${uuid}`;
  }


}
