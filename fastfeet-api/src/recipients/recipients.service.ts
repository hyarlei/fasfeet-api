import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipientDto } from './dto/create-recipient.dto';
import { UpdateRecipientDto } from './dto/update-recipient.dto';

@Injectable()
export class RecipientsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateRecipientDto) {
    return this.prisma.recipient.create({ data });
  }

  findAll() {
    return this.prisma.recipient.findMany();
  }

  async findOne(id: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return recipient;
  }

  async update(id: string, updateRecipientDto: UpdateRecipientDto) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return this.prisma.recipient.update({
      where: { id },
      data: updateRecipientDto,
    });
  }

  async remove(id: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return this.prisma.recipient.delete({
      where: { id },
    });
  }
}
