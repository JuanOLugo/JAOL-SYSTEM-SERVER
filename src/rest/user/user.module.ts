import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserUtilService } from './user-util.service';
import { Company } from '../company/entities/company.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Role])],
  controllers: [UserController],
  providers: [UserService, UserUtilService],
  exports: [UserUtilService],
})
export class UserModule {}
