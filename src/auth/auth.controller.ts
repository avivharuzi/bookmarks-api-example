import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthToken } from './auth-token';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto): Promise<AuthToken> {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto): Promise<AuthToken> {
    return this.authService.login(dto);
  }
}
