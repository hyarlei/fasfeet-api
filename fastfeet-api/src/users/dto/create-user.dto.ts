import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

enum UserRole {
  ADMIN = 'ADMIN',
  DELIVERY = 'DELIVERYMAN',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
