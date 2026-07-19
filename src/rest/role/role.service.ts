import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Role } from './entities/role.entity';
import { ILike, In, Not, QueryFailedError, Repository } from 'typeorm';
import { Permission } from './entities/permissions.entity';
import { RolePermission } from './entities/role_permissions.entity';
import { DefaultReturnRestapi } from 'src/utils/interfaces/return-restapi';
import { isUUID } from 'class-validator';
import { DeleteRoleDto, GetRoleByIdDto, GetRolesDto } from './dto/any-role.dto';

@Injectable()
export class RoleService {


  constructor(

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

  ) { }

  async create(
    createRoleDto: CreateRoleDto,
  ): Promise<DefaultReturnRestapi<Partial<Role>>> {
    const { companyId, name, permissionIds, description } = createRoleDto;

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

    const existRole = await this.roleRepository.exists({
      where: {
        company: {
          id: companyId,
        },
        name: ILike(name.trim()),
      },
    });

    if (existRole) {
      throw new ConflictException(
        'Ya existe un rol con ese nombre dentro de la compañía.',
      );
    }

    const permissions = await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
      },
      relations: {
        module: true,
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException(
        'Uno o más permisos enviados no existen.',
      );
    }

    const role = new Role();

    role.company = company;
    role.name = name.trim();
    role.description = description?.trim();
    role.permissions = [];

    for (const permission of permissions) {
      const rolePermission = new RolePermission();

      rolePermission.permission = permission;
      rolePermission.role = role;

      role.permissions.push(rolePermission);
    }

    try {
      const saveRole = await this.roleRepository.save(role);

      return {
        message: 'Rol creado correctamente.',
        data: {
          id: saveRole.id,
          name: saveRole.name,
          description: saveRole.description,
          createdAt: saveRole.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error creando el rol ${name}.`,
        error instanceof Error ? error.stack : String(error),
        RoleService.name,
      );

      if (error instanceof QueryFailedError) {
        switch (error.driverError?.code) {
          /**
           * unique_violation
           */
          case '23505':
            throw new ConflictException(
              'Ya existe un rol registrado con esa información.',
            );

          /**
           * foreign_key_violation
           */
          case '23503':
            throw new BadRequestException(
              'La información relacionada con el rol no es válida.',
            );

          /**
           * string_data_right_truncation
           */
          case '22001':
            throw new BadRequestException(
              'Uno o más campos superan la longitud permitida.',
            );

          /**
           * not_null_violation
           */
          case '23502':
            throw new BadRequestException(
              'Faltan datos obligatorios para crear el rol.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al crear el rol.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al crear el rol.',
      );
    }
  }

  async update(
    updateRoleDto: UpdateRoleDto,
  ): Promise<DefaultReturnRestapi<Partial<Role>>> {
    const {
      id,
      companyId,
      name,
      description,
      isActive,
      permissionIds,
    } = updateRoleDto;

    if (!isUUID(id)) {
      throw new BadRequestException(
        'El identificador del rol no tiene un formato válido.',
      );
    }

    if (!isUUID(companyId)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    const role = await this.roleRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
      relations: {
        permissions: {
          permission: true,
        },
        company: true,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'No se encontró el rol indicado.',
      );
    }

    if (name) {
      const existRole = await this.roleRepository.exists({
        where: {
          company: {
            id: companyId,
          },
          name: ILike(name.trim()),
          id: Not(id),
        },
      });

      if (existRole) {
        throw new ConflictException(
          'Ya existe otro rol con ese nombre dentro de la compañía.',
        );
      }
    }

    if (permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(permissionIds),
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException(
          'Uno o más permisos enviados no existen.',
        );
      }

      role.permissions = [];

      for (const permission of permissions) {
        const rolePermission = new RolePermission();

        rolePermission.role = role;
        rolePermission.permission = permission;

        role.permissions.push(rolePermission);
      }
    }

    role.name = name?.trim().replace(/\s+/g, ' ') || role.name;
    role.description = description ?? role.description;
    role.isActive = isActive ?? role.isActive;

    try {
      const saveRole = await this.roleRepository.save(role);

      return {
        message: 'Rol actualizado correctamente.',
        data: {
          id: saveRole.id,
          name: saveRole.name,
          description: saveRole.description,
          isActive: saveRole.isActive,
          updatedAt: saveRole.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error actualizando el rol ${id}.`,
        error instanceof Error ? error.stack : String(error),
        RoleService.name,
      );

      if (error instanceof QueryFailedError) {
        switch (error.driverError?.code) {
          case '23505':
            throw new ConflictException(
              'Ya existe un rol con esa información.',
            );

          case '23503':
            throw new BadRequestException(
              'Uno de los permisos enviados no es válido.',
            );

          case '22001':
            throw new BadRequestException(
              'Uno o más campos superan la longitud permitida.',
            );

          case '23502':
            throw new BadRequestException(
              'Faltan datos obligatorios para actualizar el rol.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al actualizar el rol.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al actualizar el rol.',
      );
    }
  }

  async getAll(
    getRolesDto: GetRolesDto,
  ): Promise<DefaultReturnRestapi<{
    roles: Role[]
    total: number
  }>> {
    const { companyId, page, limit, filter } = getRolesDto;

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

    try {
      const query = this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.permissions', 'rolePermission')
        .leftJoinAndSelect('rolePermission.permission', 'permission')
        .leftJoin('role.company', 'company')
        .where('company.id = :companyId', {
          companyId,
        });

      if (filter?.name) {
        query.andWhere(
          'LOWER(role.name) LIKE LOWER(:name)',
          {
            name: `%${filter.name.trim()}%`,
          },
        );
      }

      if (filter?.isActive !== undefined) {
        query.andWhere(
          'role.isActive = :isActive',
          {
            isActive: filter.isActive,
          },
        );
      }

      query
        .select([
          'role.id',
          'role.name',
          'role.description',
          'role.isActive',
          'role.createdAt',

          'rolePermission.id',

          'permission.id',
          'permission.code',
          'permission.description',
        ])
        .orderBy('role.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [roles, total] = await query.getManyAndCount();

      return {
        message: 'Roles obtenidos correctamente.',
        data: {
          roles,
          total
        },

      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error obteniendo roles de la compañía ${companyId}.`,
        error instanceof Error ? error.stack : String(error),
        RoleService.name,
      );

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Ocurrió un error al consultar los roles.',
        );
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al consultar los roles.',
      );
    }
  }

  async getById(
    getRoleByIdDto: GetRoleByIdDto,
  ): Promise<DefaultReturnRestapi<Role>> {
    const { id, companyId } = getRoleByIdDto;

    if (!isUUID(id)) {
      throw new BadRequestException(
        'El identificador del rol no tiene un formato válido.',
      );
    }

    if (!isUUID(companyId)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    try {
      const role = await this.roleRepository.findOne({
        where: {
          id,
          company: {
            id: companyId,
          },
        },
        relations: {
          permissions: {
            permission: {
              module: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            id: true,
            permission: {
              id: true,
              code: true,
              description: true,
              module: {
                id: true,
                name: true,
                path: true,
              },
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException(
          'No se encontró el rol solicitado para la compañía indicada.',
        );
      }

      return {
        message: 'Rol obtenido correctamente.',
        data: role,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      Logger.error(
        `Error obteniendo el rol ${id}.`,
        error instanceof Error ? error.stack : String(error),
        RoleService.name,
      );

      if (error instanceof QueryFailedError) {
        switch (error.driverError?.code) {
          case '23503':
            throw new BadRequestException(
              'La información relacionada con el rol no es válida.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al consultar el rol.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al consultar el rol.',
      );
    }
  }

  async delete(
    deleteRoleDto: DeleteRoleDto,
  ): Promise<DefaultReturnRestapi<null>> {
    const { id, companyId } = deleteRoleDto;

    if (!isUUID(id)) {
      throw new BadRequestException(
        'El identificador del rol no tiene un formato válido.',
      );
    }

    if (!isUUID(companyId)) {
      throw new BadRequestException(
        'El identificador de la compañía no tiene un formato válido.',
      );
    }

    const role = await this.roleRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
      relations: {
        userRoles: true,
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'No se encontró el rol indicado para la compañía.',
      );
    }

    /**
     * No permitir eliminar un rol asignado a usuarios.
     */
    if (role.userRoles.length > 0) {
      throw new ConflictException(
        'No es posible eliminar el rol porque actualmente está asignado a uno o más usuarios.',
      );
    }

    try {
      await this.roleRepository.remove(role);

      return {
        message: 'Rol eliminado correctamente.',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      Logger.error(
        `Error eliminando el rol ${id}.`,
        error instanceof Error ? error.stack : String(error),
        RoleService.name,
      );

      if (error instanceof QueryFailedError) {
        switch (error.driverError?.code) {
          /**
           * foreign_key_violation
           */
          case '23503':
            throw new ConflictException(
              'No es posible eliminar el rol porque tiene información relacionada dentro del sistema.',
            );

          /**
           * restrict_violation
           */
          case '23001':
            throw new ConflictException(
              'El rol está siendo utilizado y no puede eliminarse.',
            );

          default:
            throw new InternalServerErrorException(
              'Ocurrió un error al eliminar el rol.',
            );
        }
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al eliminar el rol.',
      );
    }
  }


}
