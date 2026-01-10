import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  // app.enableCors("*")
  //   app.enableCors({
  //   origin: 'http://localhost:5173', // React dev URL
  //   credentials: true,
  // });
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://192.168.0.238:5173'
    ],
    credentials: true,
  });



  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  await app.listen(4000);

  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
