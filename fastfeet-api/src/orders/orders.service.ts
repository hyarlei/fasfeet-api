import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const tracking_code = `TRK-${randomBytes(4).toString('hex').toUpperCase()}`;

    return this.prisma.order.create({
      data: {
        recipient_id: createOrderDto.recipient_id,
        deliveryman_id: createOrderDto.deliveryman_id,
        tracking_code,
        status: 'WAITING',
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        recipient: true,
        deliveryman: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        recipient: true,
        deliveryman: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { recipient_id, deliveryman_id, status, photo_url, tracking_code } =
      updateOrderDto;

    const updateData: {
      status?: OrderStatus;
      withdrawn_at?: Date;
      delivered_at?: Date;
      photo_url?: string;
      tracking_code?: string;
      recipient?: { connect: { id: string } };
      deliveryman?: { connect: { id: string } };
    } = {};

    if (status !== undefined) {
      updateData.status = status as OrderStatus;

      if (status === 'WITHDRAWN' && !order.withdrawn_at) {
        updateData.withdrawn_at = new Date();
      }
      if (status === 'DELIVERED' && !order.delivered_at) {
        updateData.delivered_at = new Date();
      }
    }

    if (photo_url !== undefined) {
      updateData.photo_url = photo_url as string;
    }
    if (tracking_code !== undefined) {
      updateData.tracking_code = tracking_code as string;
    }

    if (recipient_id) {
      updateData.recipient = {
        connect: { id: recipient_id },
      };
    }

    if (deliveryman_id) {
      updateData.deliveryman = {
        connect: { id: deliveryman_id },
      };
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }

  findAllDeliveryman(deliverymanId: string) {
    return this.prisma.order.findMany({
      where: {
        deliveryman_id: deliverymanId,
        status: { not: 'DELIVERED' },
      },
      include: { recipient: true },
    });
  }

  async markAsWithdrawn(orderId: string, deliverymanId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.deliveryman_id !== deliverymanId) {
      throw new UnauthorizedException('This order is not yours.');
    }

    if (order.status !== 'WAITING') {
      throw new BadRequestException('Order status is not WAITING.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'WITHDRAWN',
        withdrawn_at: new Date(),
      },
    });
  }

  async markAsDelivered(
    orderId: string,
    deliverymanId: string,
    filename: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.deliveryman_id !== deliverymanId) {
      throw new UnauthorizedException('This order is not yours.');
    }

    if (order.status !== 'WITHDRAWN') {
      throw new BadRequestException(
        'Order must be WITHDRAWN before delivered.',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        photo_url: filename,
        delivered_at: new Date(),
      },
    });
  }

  async adminMarkAsWithdrawn(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'WITHDRAWN',
        withdrawn_at: order.withdrawn_at || new Date(),
      },
    });
  }

  async adminMarkAsDelivered(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        delivered_at: order.delivered_at || new Date(),
      },
    });
  }

  async adminMarkAsCanceled(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'RETURNED',
      },
    });
  }
}
