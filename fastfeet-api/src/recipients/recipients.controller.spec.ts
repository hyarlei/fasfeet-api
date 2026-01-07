import { Test, TestingModule } from '@nestjs/testing';
import { RecipientsController } from './recipients.controller';
import { RecipientsService } from './recipients.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecipientsController', () => {
  let controller: RecipientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipientsController],
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

    controller = module.get<RecipientsController>(RecipientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
