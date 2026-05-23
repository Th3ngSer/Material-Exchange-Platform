/* eslint-disable prettier/prettier */
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
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createPostUploadOptions } from './posts-upload.config';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

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
      const count = (await this.postsService.countDocuments()) as number;
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
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, createPostUploadOptions() as any))
  create(
    @Request() req: { user: { id: string } },
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(dto, files ?? [], req.user.id);
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
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, createPostUploadOptions() as any))
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.postsService.update(id, dto, files ?? [], req.user.id);
  }

  // ─── DELETE /posts/:id ─────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.postsService.removeOwned(id, req.user.id) as Promise<{ message: string }>;
  }

  // ─── DELETE /posts/admin/:id ─────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  removeForAdmin(@Param('id') id: string) {
    return this.postsService.removeAny(id) as Promise<{ message: string }>;
  }
}
