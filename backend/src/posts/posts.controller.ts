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
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CloudinaryService } from './cloudinary.service';


@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly activityLogService: ActivityLogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      const count = (await this.postsService.countDocuments());
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
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Req() req: { user: { id: string } },
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() dto: CreatePostDto,
  ) {
    const imageUrls = files && files.length > 0
      ? await Promise.all(files.map((file) => this.cloudinaryService.uploadImage(file)))
      : [];
    return this.postsService.create(dto, imageUrls, req.user.id);
  }

  // ─── GET /posts ────────────────────────────────────────────────────────────
  @Get()
  findAll(
    @Query()
    query: {
      type?: string;
      category?: string;
      condition?: string;
      ownerId?: string;
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
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const imageUrls = files && files.length > 0
      ? await Promise.all(files.map((file) => this.cloudinaryService.uploadImage(file)))
      : [];
    return this.postsService.update(id, dto, imageUrls, req.user.id);
  }

  // ─── DELETE /posts/:id ─────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.postsService.removeOwned(id, req.user.id) as Promise<{ message: string }>;
  }

  // ─── DELETE /posts/admin/:id ─────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  async removeForAdmin(
    @Param('id') id: string,
    @Req() req: { user: { id: string; email: string } },
  ) {
    const result = await this.postsService.removeAny(id);

    await this.activityLogService.logAction({
      adminId: req.user.id,
      adminName: req.user.email,
      action: 'DELETE_POST',
      details: `Deleted post ${id}`,
    });

    return result;
  }
}