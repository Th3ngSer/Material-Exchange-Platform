import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedRequest {
  user: { id: string } & JwtPayload;
}

@Controller('ratings')
export class RatingsController {
  private readonly logger = new Logger(RatingsController.name);

  constructor(private readonly ratingsService: RatingsService) {}

  // SUBMIT OR UPDATE A RATING
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrUpdateRating(
    @Body()
    body: {
      userId: string; // user being rated
      score: number;
      comment?: string;
      tags?: string[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const raterId = req.user.id;

      // Check if user can rate
      const canRate = this.ratingsService.canUserRate(raterId, body.userId);
      if (!canRate) {
        throw new HttpException(
          'You cannot rate yourself',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Fetch rater's info from database to store in rating
      const raterInfo = await this.ratingsService.getRaterInfo(raterId);

      const result = await this.ratingsService.createOrUpdateRating({
        userId: body.userId,
        raterId,
        score: body.score,
        comment: body.comment,
        tags: body.tags,
        raterName: raterInfo?.name || 'User',
        raterAvatar: raterInfo?.avatar || '',
      });

      this.logger.log(`User ${raterId} rated user ${body.userId}`);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create rating';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  // GET RATING STATISTICS AND RECENT REVIEWS FOR A USER
  @Get('user/:userId')
  async getUserRatingStats(@Param('userId') userId: string) {
    try {
      const stats = await this.ratingsService.getRatingStats(userId);
      return stats;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch ratings';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET ALL RATINGS FOR A USER (with pagination support if needed)
  @Get('user/:userId/all')
  async getAllRatingsForUser(@Param('userId') userId: string) {
    try {
      const ratings = await this.ratingsService.getRatingsForUser(userId);
      this.logger.log(
        `getAllRatingsForUser: returning ${ratings.length} ratings for user ${userId}`,
      );
      return ratings;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch ratings';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE A RATING
  @UseGuards(JwtAuthGuard)
  @Delete(':ratingId')
  async deleteRating(
    @Param('ratingId') ratingId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const success = await this.ratingsService.deleteRating(
        ratingId,
        req.user.id,
      );

      if (!success) {
        throw new HttpException(
          'Rating not found or unauthorized',
          HttpStatus.NOT_FOUND,
        );
      }

      this.logger.log(`Rating ${ratingId} deleted by user ${req.user.id}`);
      return { message: 'Rating deleted successfully' };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete rating';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
