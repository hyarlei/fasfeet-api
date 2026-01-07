import { Test, TestingModule } from '@nestjs/testing';
import { RecipientsService } from './recipients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecipientsService', () => {
  let service: RecipientsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipientsService,
        {
          provide: PrismaService,
          useValue: {
            recipient: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecipientsService>(RecipientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
