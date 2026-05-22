import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

// ── Multer storage config (reused for both create & update) ──────────────────
function multerStorage() {
  const dir = process.env.UPLOAD_DIR ?? 'uploads';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) =>
      cb(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`),
  });
}

// ── Shared file validation pipe ──────────────────────────────────────────────
const imageFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
  ],
  fileIsRequired: false, // allow zero files on PATCH
});

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAllForAdmin() {
    return this.postsService.findAllForAdmin();
  }

  // ─── HEALTH CHECK ──────────────────────────────────────────────────────────
  @Get('health/db')
  @HttpCode(HttpStatus.OK)
  async checkDatabase() {
    try {
      this.logger.log('Checking database connection...');
      const count = await this.postsService['postModel'].countDocuments();
      this.logger.log('✅ Database connection successful');
      return {
        status: 'connected',
        message: 'MongoDB is connected and working',
        collection: 'posts',
        documentCount: count,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        '❌ Database connection failed:',
        err?.message || String(error),
      );
      return {
        status: 'disconnected',
        message: (err?.message as string) || 'Failed to connect to MongoDB',
        hint: 'Make sure MongoDB is running on localhost:27017',
      };
    }
  }

  // ─── POST /posts ───────────────────────────────────────────────────────────
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { storage: multerStorage() }))
  create(
    @UploadedFiles(imageFilePipe) files: Express.Multer.File[],
    @Body() dto: CreatePostDto,
  ) {
    const normalizedFiles = files ?? [];
    normalizedFiles.forEach((file) => {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type');
      }
    });
    return this.postsService.create(dto, normalizedFiles);
  }

  // ─── GET /posts ────────────────────────────────────────────────────────────
  @Get()
  findAll(
    @Query()
    query: {
      type?: string;
      category?: string;
      condition?: string;
      page?: string;
      limit?: string;
    },
  ) {
    return this.postsService.findAll(query);
  }

  // ─── GET /posts/:id ────────────────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  // ─── PATCH /posts/:id ──────────────────────────────────────────────────────
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: multerStorage() }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFiles(imageFilePipe) files: Express.Multer.File[],
  ) {
    const normalizedFiles = files ?? [];
    normalizedFiles.forEach((file) => {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type');
      }
    });
    return this.postsService.update(id, dto, normalizedFiles);
  }

  // ─── DELETE /posts/:id ─────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
