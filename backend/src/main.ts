import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './users/schemas/user.schema';

async function seedAdmin(app: NestExpressApplication) {
  const rawEmail = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawEmail || !rawPassword) {
    console.log('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
    return;
  }

  const email = rawEmail.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const existing = await userModel.findOne({ email }).exec();

  if (!existing) {
    await userModel.create({
      email,
      password: passwordHash,
      name: 'Admin',
      role: UserRole.ADMIN,
    });
    console.log(`Admin seed created: ${email}`);
    return;
  }

  const updates: Partial<User> = {};
  if (existing.role !== UserRole.ADMIN) {
    updates.role = UserRole.ADMIN;
  }

  if (process.env.ADMIN_RESET_PASSWORD === 'true') {
    updates.password = passwordHash;
  }

  if (Object.keys(updates).length > 0) {
    await userModel.updateOne({ _id: existing._id }, updates).exec();
    console.log(`Admin seed updated: ${email}`);
  }
}

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
  const allowedOrigins = [
    'https://material-exchange-platform.pages.dev',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isCloudflarePages =
        origin.endsWith('.material-exchange-platform.pages.dev') ||
        origin === 'https://material-exchange-platform.pages.dev';
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (
        isCloudflarePages ||
        isLocal ||
        allowedOrigins.includes(origin) ||
        (explicitOrigin && origin === explicitOrigin)
      ) {
        return callback(null, true);
      }
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

  await seedAdmin(app);

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
}

void bootstrap();
