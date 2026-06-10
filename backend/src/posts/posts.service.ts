import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Post, PostDocument } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';
import { AdminSettingsService } from '../admin/admin-settings.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly usersService: UsersService,
    private readonly settingsService: AdminSettingsService,
  ) {
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
    filesOrUrls: Express.Multer.File[] | string[],
    ownerId: string,
  ): Promise<Post> {
    try {
      this.assertValidId(ownerId, 'owner');
      this.logger.log(`Creating post: ${dto.title}`);
      if (filesOrUrls.length === 0) {
        throw new BadRequestException('At least one image is required.');
      }

      const owner = await this.usersService.findById(ownerId);

      // Validate Admin Settings dynamically
      const settings = await this.settingsService.getSettings();
      if (settings.maintenanceMode && owner?.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'The platform is currently in maintenance mode. Creating new listings is temporarily disabled.',
        );
      }

      const currentListingsCount = await this.postModel.countDocuments({
        ownerId,
      });
      if (currentListingsCount >= settings.maxListingsPerUser) {
        throw new ForbiddenException(
          `You have reached the maximum listing limit of ${settings.maxListingsPerUser} posts set by the administrator.`,
        );
      }

      const listerName =
        owner?.username || owner?.name || owner?.email || 'Unknown';
      const listerAvatar = owner?.avatar || undefined;

      const images = filesOrUrls.map((f) => typeof f === 'string' ? f : f.filename);
      const post = await this.postModel.create({
        ...dto,
        ownerId,
        listerName,
        listerAvatar,
        price: dto.price,
        images,
      });
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

  async countDocuments(): Promise<number> {
    return this.postModel.countDocuments();
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
    ownerId?: string;
    page?: string;
    limit?: string;
  }) {
    try {
      this.logger.log(`Fetching posts with filters: ${JSON.stringify(query)}`);
      const {
        type,
        category,
        condition,
        ownerId,
        page = '1',
        limit = '20',
      } = query;

      const filter: Record<string, any> = {};
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (condition) filter.condition = condition;
      if (ownerId) filter.ownerId = ownerId;

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
      this.assertValidId(id);
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
    filesOrUrls: Express.Multer.File[] | string[],
    ownerId: string,
  ): Promise<Post> {
    try {
      this.assertValidId(id);
      this.assertValidId(ownerId, 'owner');
      this.logger.log(`Updating post: ${id}`);
      const post = await this.postModel.findById(id);
      if (!post) {
        this.logger.warn(`Post not found for update: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }

      if (post.ownerId && String(post.ownerId) !== ownerId) {
        throw new ForbiddenException('You can only update your own post.');
      }

      const newImages = filesOrUrls.map((f) => typeof f === 'string' ? f : f.filename);
      const keepImages = this.parseRetainedImages(
        dto.retainImages,
        post.images,
      );
      const removedImages = post.images.filter(
        (image) => !keepImages.includes(image),
      );

      if (removedImages.length > 0) {
        this.logger.log(
          `Removing ${removedImages.length} old images from disk`,
        );
        this.deleteImageFiles(removedImages);
      }

      const images = [...keepImages, ...newImages];

      const updated = await this.postModel.findByIdAndUpdate(
        id,
        {
          ...dto,
          price: dto.price,
          images,
        },
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

  private parseRetainedImages(
    retainImages: string | undefined,
    fallback: string[],
  ): string[] {
    if (retainImages === undefined) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(retainImages) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (image): image is string =>
          typeof image === 'string' && image.trim().length > 0,
      );
    } catch {
      return [];
    }
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    return this.removeOwned(id, undefined);
  }

  async removeAny(id: string): Promise<{ message: string }> {
    try {
      this.assertValidId(id);

      this.logger.log(`Admin deleting post: ${id}`);
      const post = await this.postModel.findById(id);
      if (!post) {
        this.logger.warn(`Post not found for admin deletion: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }

      await this.postModel.findByIdAndDelete(id);
      this.deleteImageFiles(post.images);
      this.logger.log(`✅ Post deleted by admin: ${id}`);
      return { message: 'Post deleted successfully' };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        `❌ Failed to admin-delete post ${id}: ${err?.message || String(error)}`,
      );
      throw error;
    }
  }

  async removeOwned(
    id: string,
    ownerId?: string,
  ): Promise<{ message: string }> {
    try {
      this.assertValidId(id);
      if (ownerId) {
        this.assertValidId(ownerId, 'owner');
      }

      this.logger.log(`Deleting post: ${id}`);
      const post = await this.postModel.findById(id);
      if (!post) {
        this.logger.warn(`Post not found for deletion: ${id}`);
        throw new NotFoundException(`Post #${id} not found`);
      }

      if (ownerId && String(post.ownerId) !== ownerId) {
        throw new ForbiddenException('You can only delete your own post.');
      }

      await this.postModel.findByIdAndDelete(id);

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

  // ─── UPDATE USER POSTS ─────────────────────────────────────────────────────
  /**
   * Update all posts owned by a user with new avatar/name
   * Called when user updates their profile
   */
  async updateUserPostsAvatar(
    ownerId: string,
    listerName: string,
    listerAvatar?: string,
  ): Promise<{ modifiedCount: number }> {
    try {
      this.assertValidId(ownerId, 'owner');

      // Update posts by ownerId (newer posts)
      const result = await this.postModel.updateMany(
        { ownerId },
        { listerName, listerAvatar },
      );

      // Also update by listerName as fallback for old posts without ownerId
      const resultByName = await this.postModel.updateMany(
        { listerName: { $exists: true }, ownerId: { $exists: false } },
        { listerName, listerAvatar },
      );

      const totalModified = result.modifiedCount + resultByName.modifiedCount;
      this.logger.log(
        `✅ Updated posts for user ${ownerId}: ${result.modifiedCount} by ID + ${resultByName.modifiedCount} by name = ${totalModified} total`,
      );
      return { modifiedCount: totalModified };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        `❌ Failed to update user posts: ${err?.message || String(error)}`,
      );
      throw error;
    }
  }

  // ─── Helper ───────────────────────────────────────────────────────────────
  private deleteImageFiles(images: string[]) {
    const dir = process.env.UPLOAD_DIR ?? 'uploads';
    images.forEach((img) => {
      const filePath = path.join(process.cwd(), dir, img);
      if (fs.existsSync(filePath)) {
        return fs.unlink(filePath, () => {});
      }
      return undefined;
    });
  }

  private assertValidId(id: string, label = 'post') {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ${label} id: ${id}`);
    }
  }

}
