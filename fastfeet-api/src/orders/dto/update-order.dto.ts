import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  recipient_id?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  deliveryman_id?: string;

  @IsOptional()
  @IsEnum(['WAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
  status?: 'WAITING' | 'WITHDRAWN' | 'DELIVERED' | 'RETURNED';

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  tracking_code?: string;
}
