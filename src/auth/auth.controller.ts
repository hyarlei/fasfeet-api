import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  cpf: string;
  password: string;
}

@Controller('sessions')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.authService.authenticate(body.cpf, body.password);
  }
}
