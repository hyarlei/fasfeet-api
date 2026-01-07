import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // Admin pode alterar status manualmente
  @Patch(':id/status/withdrawn')
  @Roles('ADMIN')
  markAsWithdrawnByAdmin(@Param('id') id: string) {
    return this.ordersService.adminMarkAsWithdrawn(id);
  }

  @Patch(':id/status/delivered')
  @Roles('ADMIN')
  markAsDeliveredByAdmin(@Param('id') id: string) {
    return this.ordersService.adminMarkAsDelivered(id);
  }

  @Patch(':id/status/canceled')
  @Roles('ADMIN')
  markAsCanceled(@Param('id') id: string) {
    return this.ordersService.adminMarkAsCanceled(id);
  }

  @Get('delivery')
  @Roles('DELIVERYMAN')
  findMyOrders(@Request() req: { user: { sub: string } }) {
    return this.ordersService.findAllDeliveryman(req.user.sub);
  }

  @Patch(':id/pickup')
  @Roles('DELIVERYMAN')
  pickup(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.ordersService.markAsWithdrawn(id, req.user.sub);
  }

  @Patch(':id/deliver')
  @Roles('DELIVERYMAN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async deliver(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG and PNG images are allowed. Received: ' + file.mimetype,
      );
    }

    return this.ordersService.markAsDelivered(id, req.user.sub, file.filename);
  }
}
