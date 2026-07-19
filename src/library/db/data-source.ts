import { Logger } from '@nestjs/common';
import { join } from 'path';
import envUtils from 'src/utils/env.utils';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: envUtils.getEnv('DB_HOST'),
    port: Number(envUtils.getEnv('DB_PORT')) ?? 5432,
    username: envUtils.getEnv('DB_USERNAME'),
    password: envUtils.getEnv('DB_PASSWORD'),
    database: envUtils.getEnv('DB_DATABASE'),
    entities: [join(__dirname, '../../rest/**/entities/*.entity{.ts,.js}')],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: true,
  });

AppDataSource.initialize().then(dataSource => {
    Logger.log('Se ha establecido la conexión a la base de datos', 'BASE DE DATOS');
}).catch(error => {
    Logger.error(`Error al establecer la conexión a la base de datos: ${error.message}`, 'BASE DE DATOS');
});
