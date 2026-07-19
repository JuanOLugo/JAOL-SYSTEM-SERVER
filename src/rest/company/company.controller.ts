import {
  Controller,
  Get,
  Post,
  Body,

  Param,
  Delete,

} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompaniesDto } from './dto/any-company.dto';


@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post('create')
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyService.create(createCompanyDto);
  }

  @Get('get-by-id/:id')
  async getCompanyById(@Param('id') id: string) {
    return await this.companyService.getCompanyById(id);
  }

  @Post('get-all')
  async getAllCompanies(@Body() getCompaniesDto: GetCompaniesDto) {
    return await this.companyService.getCompanies(getCompaniesDto);
  }

  @Post('update')
  async updateCompany(@Body() updateCompanyDto: UpdateCompanyDto) {
    return await this.companyService.updateCompany(updateCompanyDto);
  }

  @Delete("remove/:id")
  async deleteCompany(@Param("id") id: string) {
    return await this.companyService.deleteCompany(id);
  }

}
