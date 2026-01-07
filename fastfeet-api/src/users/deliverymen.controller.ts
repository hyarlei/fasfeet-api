import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Deliverymen')
@ApiBearerAuth()
@Controller('deliverymen')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DeliverymenController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    const users = await this.usersService.findAllDeliverymen();
    return users.map((user) => new UserEntity(user));
  }
}
