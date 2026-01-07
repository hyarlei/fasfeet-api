import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DeliverymenController } from './deliverymen.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, DeliverymenController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
