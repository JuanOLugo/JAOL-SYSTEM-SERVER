import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';

@Injectable()
export class DatabaseService {
  private DataSource: DataSource = AppDataSource;
}
