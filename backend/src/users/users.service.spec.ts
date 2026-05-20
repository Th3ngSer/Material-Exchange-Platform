import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let exec: jest.Mock;

  beforeEach(async () => {
    exec = jest.fn();
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnValue(query),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('maps admin users to include id and defaults', async () => {
    const userId = new Types.ObjectId();
    const createdAt = new Date('2024-01-01T00:00:00Z');

    exec.mockResolvedValueOnce([
      {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        createdAt,
      },
    ]);

    const results = await service.findAllForAdmin();

    expect(results).toEqual([
      {
        id: userId.toString(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
        listingsCount: 0,
        rating: 0,
        createdAt,
      },
    ]);
  });
});
