import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdminDashboardService } from './admin-dashboard.service';
import { Post } from '../posts/entities/post.entity';
import { TrackItemUser } from '../trackitemuser/schemas/trackitemuser.schema';
import { User } from '../users/schemas/user.schema';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getModelToken(User.name),
          useValue: { countDocuments: jest.fn() },
        },
        {
          provide: getModelToken(Post.name),
          useValue: { countDocuments: jest.fn() },
        },
        {
          provide: getModelToken(TrackItemUser.name),
          useValue: { countDocuments: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
