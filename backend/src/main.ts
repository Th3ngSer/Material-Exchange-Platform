import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipe -- auto-validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: false,
      transform: true, // auto-cast types
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173', // your Vue frontend
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Serve uploaded images as static: GET /uploads/filename.jpg
  app.useStaticAssets(
    join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
    {
      prefix: '/uploads',
    },
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
void bootstrap();
