import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../posts/entities/post.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
