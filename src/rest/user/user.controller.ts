import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto, RemoveUserDto } from './dto/any-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("create")
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUserToCompany(createUserDto)
  }


  @Post("update")
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUserToCompany(updateUserDto)
  }

  @Post("remove")
  async removeUser(@Body() removeUserDto: RemoveUserDto) {
    return await this.userService.deleteUserToCompany(removeUserDto)
  }

  @Post("get-by-company")
  async getUsersByCompany(@Body() getUserByCompanyDto: GetUsersDto) {
    return await this.userService.getUsersCompany(getUserByCompanyDto)
  }

  @Post("get-by-id")
  async getUserById(@Body() getUserByIdDto: RemoveUserDto){
    return await this.userService.getUserById(getUserByIdDto)
  }

}
