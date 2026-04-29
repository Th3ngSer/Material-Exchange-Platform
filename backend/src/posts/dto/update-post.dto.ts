import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// Every field becomes optional automatically
export class UpdatePostDto extends PartialType(CreatePostDto) {}
