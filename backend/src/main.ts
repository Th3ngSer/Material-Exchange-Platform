import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe -- auto-validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const explicitOrigin = process.env.FRONTEND_ORIGIN;
  const allowLocalhost = (origin: string) =>
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (explicitOrigin && origin === explicitOrigin) {
        return callback(null, true);
      }
      if (allowLocalhost(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Static uploads
  // Prefix all routes with /api so frontend can call /api/auth/login and /api/auth/register
  app.setGlobalPrefix('api');

  // Serve uploaded images as static: GET /uploads/filename.jpg
  app.useStaticAssets(
    join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
    {
      prefix: '/uploads',
    },
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
}

void bootstrap();
