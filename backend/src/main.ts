import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
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

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Global validation pipe -- auto-validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];

  if (process.env.FRONTEND_ORIGIN) {
    allowedOriginsEnv.push(process.env.FRONTEND_ORIGIN.trim());
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOriginsEnv.some((pattern) => {
        if (pattern === origin) return true;
        if (pattern.includes('*')) {
          const regexPattern =
            '^' +
            pattern.replace(/\./g, '\\.').replace(/\*/g, '[a-zA-Z0-9-]+') +
            '$';
          return new RegExp(regexPattern).test(origin);
        }
        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  // Static uploads
  // Prefix all routes with /api so frontend can call /api/auth/login and /api/auth/register
  app.setGlobalPrefix('api', { exclude: ['db-status'] });

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
