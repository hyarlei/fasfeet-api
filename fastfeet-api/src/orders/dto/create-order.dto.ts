import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  recipient_id: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  deliveryman_id: string;
}
