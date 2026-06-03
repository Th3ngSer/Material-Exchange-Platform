import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Post, PostDocument } from '../posts/entities/post.entity';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async searchPosts(query: SearchQueryDto) {
    const {
      q,
      category,
      type,
      condition,
      minPrice,
      maxPrice,
      page,
      limit,
      sort,
    } = query;

    // Filters for active posts
    const filters: any = { status: 'active' };

    // Keyword search using $or and $regex
    if (q) {
      filters.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Exact match filters
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (condition) filters.condition = condition;

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }

    // Sorting logic
    let sortOption: { [key: string]: SortOrder } = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.postModel
        .find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filters),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
