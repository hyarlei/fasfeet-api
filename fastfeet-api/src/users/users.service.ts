import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, cpf, password, role } = createUserDto;

    const userWithSameCpf = await this.prisma.user.findUnique({
      where: { cpf },
    });

    if (userWithSameCpf) {
      throw new Error('User with this CPF already exists');
    }

    const hashedPassword = await hash(password, 8);

    const user = await this.prisma.user.create({
      data: {
        name,
        cpf,
        password: hashedPassword,
        role,
      },
    });

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
    };
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findAllDeliverymen() {
    return this.prisma.user.findMany({
      where: {
        role: 'DELIVERYMAN',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByCpf(cpf: string) {
    return this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: Partial<CreateUserDto> = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await hash(updateUserDto.password, 8);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        deliveryman_id: userId,
      },
      include: {
        recipient: true,
      },
    });
  }
}
