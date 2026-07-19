import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { CompanyUtilsService } from '../company/company-utils.service';
import { UserUtilService } from './user-util.service';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { UserRole } from '../role/entities/user_role.entity';
import { PrivateUser } from './entities/private-user.entity';
import { hash, hashSync } from "bcrypt"
import { DefaultReturnRestapi } from 'src/utils/interfaces/return-restapi';
import { isUUID } from 'class-validator';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto, RemoveUserDto } from './dto/any-user.dto';


@Injectable()
export class UserService {


    constructor(

        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,

        private readonly userUtilService: UserUtilService,
    ) { }

    async createUserToCompany(
        createUserDto: CreateUserDto,
    ): Promise<DefaultReturnRestapi<Partial<User>>> {
        const {
            companyId,
            firstName,
            lastName,
            roleIds,
            username,
            email,
            phone,
            password,
        } = createUserDto;

        if (!isUUID(companyId)) {
            throw new BadRequestException(
                'El identificador de la compañía no tiene un formato válido.',
            );
        }

        const company = await this.companyRepository.findOne({
            where: {
                id: companyId,
            },
        });

        if (!company) {
            throw new NotFoundException(
                'No se encontró la compañía indicada.',
            );
        }

        const usernameExists = await this.userRepository.exists({
            where: {
                username,
            },
        });

        if (usernameExists) {
            throw new ConflictException(
                'El nombre de usuario ya se encuentra registrado.',
            );
        }

        if (email) {
            const emailExists = await this.userRepository.exists({
                where: {
                    email,
                },
            });

            if (emailExists) {
                throw new ConflictException(
                    'El correo electrónico ya se encuentra registrado.',
                );
            }
        }

        const roles = await this.roleRepository.find({
            where: {
                id: In(roleIds),
            },
        });

        if (roles.length !== roleIds.length) {
            throw new NotFoundException(
                'Uno o más roles enviados no existen.',
            );
        }

        const user = new User();

        user.username = username.trim();
        user.code = await this.userUtilService.generateUserCode(
            company.id,
            username,
        );
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        user.email = email?.trim().toLowerCase();
        user.phone = phone?.trim();
        user.company = company;
        user.isActive = true;

        user.roles = [];

        for (const role of roles) {
            const userRole = new UserRole();

            userRole.role = role;
            userRole.user = user;

            user.roles.push(userRole);
        }

        const privateUserConfig = new PrivateUser();

        privateUserConfig.passwordHash = await hash(password, 12);

        user.privateUser = privateUserConfig;

        try {
            const saveUser = await this.userRepository.save(user);

            return {
                message: 'Usuario creado correctamente.',
                data: {
                    id: saveUser.id,
                    code: saveUser.code,
                    username: saveUser.username,
                    firstName: saveUser.firstName,
                    lastName: saveUser.lastName,
                    email: saveUser.email,
                    createdAt: saveUser.createdAt,
                },
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(
                `Error creando el usuario ${username} para la compañía ${company.id}.`,
                error instanceof Error ? error.stack : String(error),
                UserService.name,
            );

            if (error instanceof QueryFailedError) {
                switch (error.driverError?.code) {
                    case '23505':
                        throw new ConflictException(
                            'Ya existe un usuario con la información proporcionada.',
                        );

                    case '23503':
                        throw new BadRequestException(
                            'La compañía o alguno de los roles asociados no es válido.',
                        );

                    case '23502':
                        throw new BadRequestException(
                            'Existen datos obligatorios que no fueron enviados.',
                        );

                    case '22001':
                        throw new BadRequestException(
                            'Uno o más campos superan la longitud máxima permitida.',
                        );

                    default:
                        throw new InternalServerErrorException(
                            'Ocurrió un error al crear el usuario.',
                        );
                }
            }

            throw new InternalServerErrorException(
                'Ocurrió un error inesperado al crear el usuario.',
            );
        }
    }

    async updateUserToCompany(
        updateUserDto: UpdateUserDto,
    ): Promise<DefaultReturnRestapi<Partial<User>>> {
        const {
            id,
            username,
            firstName,
            lastName,
            email,
            phone,
            isActive,
            roleIds,
        } = updateUserDto;

        if (!isUUID(id)) {
            throw new BadRequestException(
                'El identificador del usuario no tiene un formato válido.',
            );
        }

        const user = await this.userRepository.findOne({
            where: {
                id,
            },
            relations: {
                company: true,
                roles: {
                    role: true,
                },
            },
        });

        if (!user) {
            throw new NotFoundException(
                'No se encontró el usuario indicado.',
            );
        }

        /**
         * Validar username
         */
        if (username && username !== user.username) {
            const usernameExists = await this.userRepository.exists({
                where: {
                    username,
                },
            });

            if (usernameExists) {
                throw new ConflictException(
                    'El nombre de usuario ya se encuentra registrado.',
                );
            }
        }

        /**
         * Validar correo
         */
        if (email && email !== user.email) {
            const emailExists = await this.userRepository.exists({
                where: {
                    email,
                },
            });

            if (emailExists) {
                throw new ConflictException(
                    'El correo electrónico ya se encuentra registrado.',
                );
            }
        }

        /**
         * Actualizar roles
         */
        if (roleIds) {
            const roles = await this.roleRepository.find({
                where: {
                    id: In(roleIds),
                    company: {
                        id: user.company.id,
                    },
                    isActive: true,
                },
            });

            if (roles.length !== roleIds.length) {
                throw new NotFoundException(
                    'Uno o más roles enviados no existen o no pertenecen a la compañía.',
                );
            }

            user.roles = [];

            for (const role of roles) {
                const userRole = new UserRole();

                userRole.user = user;
                userRole.role = role;

                user.roles.push(userRole);
            }
        }

        /**
         * Actualizar información
         */
        user.username = username ?? user.username;
        user.firstName = firstName ?? user.firstName;
        user.lastName = lastName ?? user.lastName;
        user.email = email ?? user.email;
        user.phone = phone ?? user.phone;

        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        try {
            const saveUser = await this.userRepository.save(user);

            return {
                message: 'Usuario actualizado correctamente.',
                data: {
                    id: saveUser.id,
                    code: saveUser.code,
                    username: saveUser.username,
                    updatedAt: saveUser.updatedAt,
                },
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(
                `Error actualizando el usuario ${id}.`,
                error instanceof Error ? error.stack : String(error),
                UserService.name,
            );

            if (error instanceof QueryFailedError) {
                switch (error.driverError?.code) {
                    case '23505':
                        throw new ConflictException(
                            'Ya existe un usuario con la información proporcionada.',
                        );

                    case '23503':
                        throw new BadRequestException(
                            'Uno de los registros relacionados no es válido.',
                        );

                    case '23502':
                        throw new BadRequestException(
                            'Existen datos obligatorios que no fueron enviados.',
                        );

                    case '22001':
                        throw new BadRequestException(
                            'Uno o más campos superan la longitud máxima permitida.',
                        );

                    default:
                        throw new InternalServerErrorException(
                            'Ocurrió un error al actualizar el usuario.',
                        );
                }
            }

            throw new InternalServerErrorException(
                'Ocurrió un error inesperado al actualizar el usuario.',
            );
        }
    }

    async deleteUserToCompany(
        removeUserDto: RemoveUserDto,
    ): Promise<DefaultReturnRestapi<null>> {
        const { id, companyId } = removeUserDto;

        if (!isUUID(id)) {
            throw new BadRequestException(
                'El identificador del usuario no tiene un formato válido.',
            );
        }

        if (!isUUID(companyId)) {
            throw new BadRequestException(
                'El identificador de la compañía no tiene un formato válido.',
            );
        }

        const user = await this.userRepository.findOne({
            where: {
                id,
                company: {
                    id: companyId,
                },
            },
            relations: {
                company: true,
                privateUser: true,
                roles: true,
            },
        });

        if (!user) {
            throw new NotFoundException(
                'No se encontró el usuario en la compañía indicada.',
            );
        }

        try {
            await this.userRepository.remove(user);

            return {
                message: 'Usuario eliminado correctamente.',
                data: null,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(
                `Error eliminando el usuario ${id}.`,
                error instanceof Error ? error.stack : String(error),
                UserService.name,
            );

            if (error instanceof QueryFailedError) {
                switch (error.driverError?.code) {
                    /**
                     * Restricción de llave foránea.
                     */
                    case '23503':
                        throw new ConflictException(
                            'No es posible eliminar el usuario porque tiene información relacionada dentro del sistema.',
                        );

                    default:
                        throw new InternalServerErrorException(
                            'Ocurrió un error al eliminar el usuario.',
                        );
                }
            }

            throw new InternalServerErrorException(
                'Ocurrió un error inesperado al eliminar el usuario.',
            );
        }
    }

    async getUsersCompany(
        getUsersByCompanyDto: GetUsersDto,
    ): Promise<DefaultReturnRestapi<{ users: User[], total: number }>> {
        const { companyId, page, limit, filter } = getUsersByCompanyDto;

        if (!isUUID(companyId)) {
            throw new BadRequestException(
                'El identificador de la compañía no tiene un formato válido.',
            );
        }

        const companyExists = await this.companyRepository.exists({
            where: {
                id: companyId,
            },
        });

        if (!companyExists) {
            throw new NotFoundException(
                'No se encontró la compañía indicada.',
            );
        }

        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.company', 'company')
            .leftJoin('user.roles', 'userRole')
            .leftJoin('userRole.role', 'role')
            .where('company.id = :companyId', {
                companyId,
            });

        if (filter?.code) {
            query.andWhere('LOWER(user.code) LIKE LOWER(:code)', {
                code: `%${filter.code.trim()}%`,
            });
        }

        if (filter?.name) {
            query.andWhere(
                `
      (
        LOWER(user.firstName) LIKE LOWER(:name)
        OR LOWER(user.lastName) LIKE LOWER(:name)
        OR LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:name)
      )
      `,
                {
                    name: `%${filter.name.trim()}%`,
                },
            );
        }

        query
            .select([
                'user.id',
                'user.code',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.phone',
                'user.isActive',
                'user.createdAt',

                'role.id',
                'role.name',
            ])
            .orderBy('user.firstName', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        try {
            const [users, total] = await query.getManyAndCount();

            return {
                message: 'Usuarios obtenidos correctamente.',
                data: {
                    users,
                    total
                },

            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(
                `Error obteniendo usuarios de la compañía ${companyId}.`,
                error instanceof Error ? error.stack : String(error),
                UserService.name,
            );

            if (error instanceof QueryFailedError) {
                throw new InternalServerErrorException(
                    'Ocurrió un error al consultar los usuarios.',
                );
            }

            throw new InternalServerErrorException(
                'Ocurrió un error inesperado al consultar los usuarios.',
            );
        }
    }

    async getUserById(
        getUserDto: RemoveUserDto,
    ): Promise<DefaultReturnRestapi<Partial<User>>> {
        const { id, companyId } = getUserDto;

        if (!isUUID(id)) {
            throw new BadRequestException(
                'El identificador del usuario no tiene un formato válido.',
            );
        }

        if (!isUUID(companyId)) {
            throw new BadRequestException(
                'El identificador de la compañía no tiene un formato válido.',
            );
        }

        try {
            const user = await this.userRepository.findOne({
                where: {
                    id,
                    company: {
                        id: companyId,
                    },
                },
                relations: {
                    roles: {
                        role: true,
                    },
                },
                select: {
                    id: true,
                    code: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    roles: {
                        id: true,
                        role: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new NotFoundException(
                    'No se encontró el usuario en la compañía indicada.',
                );
            }

            return {
                message: 'Usuario obtenido correctamente.',
                data: user,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(
                `Error obteniendo el usuario ${id}.`,
                error instanceof Error ? error.stack : String(error),
                UserService.name,
            );

            if (error instanceof QueryFailedError) {
                throw new InternalServerErrorException(
                    'Ocurrió un error al consultar el usuario.',
                );
            }

            throw new InternalServerErrorException(
                'Ocurrió un error inesperado al consultar el usuario.',
            );
        }
    }



}
