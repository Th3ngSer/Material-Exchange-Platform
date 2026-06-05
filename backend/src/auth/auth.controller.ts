import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChatGateway } from '../chat/chat.gateway';
import { PostsService } from '../posts/posts.service';
import { RatingsService } from '../ratings/ratings.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface AuthenticatedRequest {
  user: { id: string; email?: string; role?: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
    private readonly ratingsService: RatingsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadAvatar(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = `uploads/${file.filename}`;

    // Update user profile with new avatar
    const updatedUser = await this.authService.updateProfile(req.user.id, {
      avatar: avatarPath,
    });

    // Update all user's posts with new avatar
    const listerName =
      updatedUser.username ||
      updatedUser.name ||
      updatedUser.email ||
      'Unknown';
    const updateResult = await this.postsService.updateUserPostsAvatar(
      req.user.id,
      listerName,
      avatarPath,
    );

    const ratingUpdateResult = await this.ratingsService.updateRaterAvatar(
      req.user.id,
      avatarPath,
    );

    console.log(`✅ Avatar upload complete for user ${req.user.id}`);
    console.log(
      `   Updated ${updateResult.modifiedCount} posts with new avatar`,
    );
    console.log(
      `   Updated ${ratingUpdateResult.modifiedCount} ratings with new avatar`,
    );
    console.log(`   User: ${listerName}, Avatar: ${avatarPath}`);

    // Broadcast profile update to connected clients so they can refresh caches
    try {
      console.log(`Emitting profileUpdated for ${req.user.id}`);
      if (!this.chatGateway?.server) {
        console.warn('ChatGateway.server is not initialized yet');
      }
      this.chatGateway.server.emit('profileUpdated', {
        userId: req.user.id,
        avatar: avatarPath,
        username: listerName,
      });
      console.log('profileUpdated emitted');
    } catch (err) {
      console.warn('Failed to emit profileUpdated event', err);
    }

    return {
      avatar: avatarPath,
      postsUpdated: updateResult.modifiedCount,
      ratingsUpdated: ratingUpdateResult.modifiedCount,
    };
  }

  @Get('user/:name')
  getUserByName(@Param('name') name: string) {
    return this.authService.getUserByName(name);
  }

  @Get('user/id/:id')
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
