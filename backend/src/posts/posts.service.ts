import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
    this.logger.log('PostsService initialized');
    void this.checkDatabaseConnection();
  }

  private async checkDatabaseConnection() {
    try {
      const count = await this.postModel.countDocuments();
      this.logger.log(
        `✅ Database connection successful (${count} posts in database)`,
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        '❌ Database connection failed:',
        err?.message || String(error),
      );
    }
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(
    dto: CreatePostDto,
    files: Express.Multer.File[],
  ): Promise<Post> {
    try {
      this.logger.log(`Creating post: ${dto.title}`);
      const images = files.map((f) => f.filename);
      const post = await this.postModel.create({ ...dto, images });
      this.logger.log(`✅ Post created with ID: ${String(post._id)}`);
      return post;
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      this.logger.error(
        `❌ Failed to create post: ${err?.message || String(error)}`,
      );
      if (err?.name === 'MongoServerSelectionError') {
        throw new BadRequestException(
          'Database is not connected. Please ensure MongoDB is running on localhost:27017',
        );
      }
      throw error;
    }
  }
  async findAllForAdmin() {
    try {
      this.logger.log('Fetching all posts for admin');
      const posts = await this.postModel
        .find()
        .select(
          'type title category condition price createdAt listerName status',
        )
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      this.logger.log(`✅ Found ${posts.length} posts for admin`);
      return posts;
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      this.logger.error(
        `❌ Failed to fetch posts for admin: ${err?.message || String(error)}`,
      );
      if (err?.name === 'MongoServerSelectionError') {
        throw new BadRequestException(
          'Database is not connected. Please ensure MongoDB is running on localhost:27017',
        );
      }
      throw error;
    }
  }

  // ─── READ ALL (with optional filters + pagination) ─────────────────────
  async findAll(query: {
    type?: string;
    category?: string;
    condition?: string;
    page?: string;
    limit?: string;
  }) {
    try {
      this.logger.log(`Fetching posts with filters: ${JSON.stringify(query)}`);
      const { type, category, condition, page = '1', limit = '20' } = query;

      const filter: Record<string, any> = {};
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (condition) filter.condition = condition;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await this.postModel.countDocuments(filter);
      const posts = await this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      this.logger.log(`✅ Found ${posts.length} posts (total: ${total})`);
      return { total, page: parseInt(page), posts };
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      this.logger.error(
        `❌ Failed to fetch posts: ${err?.message || String(error)}`,
      );
      if (err?.name === 'MongoServerSelectionError') {
        throw new BadRequestException(
          'Database is not connected. Please ensure MongoDB is running on localhost:27017',
        );
      }
      throw error;
    }
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<Post> {
    try {
      this.logger.log(`Fetching post: ${id}`);
      const post = await this.postModel.findById(id);
      if (!post) {
        this.logger.warn(`Post not found: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }
      this.logger.log(`✅ Post found: ${id}`);
      return post;
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        `❌ Failed to fetch post ${id}: ${err?.message || String(error)}`,
      );
      throw error;
    }
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(
    id: string,
    dto: UpdatePostDto,
    files: Express.Multer.File[],
  ): Promise<Post> {
    try {
      this.logger.log(`Updating post: ${id}`);
      const post = await this.postModel.findById(id);
      if (!post) {
        this.logger.warn(`Post not found for update: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }

      const newImages = files.map((f) => f.filename);

      // If new images uploaded, delete the old files from disk
      if (newImages.length > 0) {
        this.logger.log(
          `Replacing ${post.images.length} old images with ${newImages.length} new ones`,
        );
        this.deleteImageFiles(post.images);
      }

      const updated = await this.postModel.findByIdAndUpdate(
        id,
        { ...dto, ...(newImages.length > 0 && { images: newImages }) },
        { new: true, runValidators: true },
      );

      this.logger.log(`✅ Post updated: ${id}`);
      return updated!;
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      this.logger.error(
        `❌ Failed to update post ${id}: ${err?.message || String(error)}`,
      );
      if (err?.name === 'MongoServerSelectionError') {
        throw new BadRequestException(
          'Database is not connected. Please ensure MongoDB is running on localhost:27017',
        );
      }
      throw error;
    }
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting post: ${id}`);
      const post = await this.postModel.findByIdAndDelete(id);
      if (!post) {
        this.logger.warn(`Post not found for deletion: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }

      this.deleteImageFiles(post.images);
      this.logger.log(`✅ Post deleted: ${id}`);
      return { message: 'Post deleted successfully' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        `❌ Failed to delete post ${id}: ${err?.message || String(error)}`,
      );
      throw error;
    }
  }

  // ─── Helper ───────────────────────────────────────────────────────────────
  private deleteImageFiles(images: string[]) {
    const dir = process.env.UPLOAD_DIR ?? 'uploads';
    images.forEach((img) => {
      return fs.unlink(path.join(process.cwd(), dir, img), () => {});
    });
  }
}
