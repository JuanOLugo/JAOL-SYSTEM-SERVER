import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AddressInfo } from 'net';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3570',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  app.setViewEngine('hbs');

  try {
    const server = await app.listen(process.env.PORT ?? 3569);
    if (server) {
      const address = server.address() as AddressInfo;
      Logger.log(
        `Servidor corriendo en el puerto ${address.port}`,
        'Bootstrap',
      );
    }
  } catch (error) {
    Logger.error(`Error al iniciar el servidor: ${error.message}`, 'Bootstrap');
  }

  // PUERTO 3569 BACKEND
  // PUERTO 3570 FRONTEND
}

bootstrap();
