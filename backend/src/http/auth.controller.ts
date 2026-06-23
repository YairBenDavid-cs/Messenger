import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../domains/auth/guards/jwt-auth.guard';
import { LoginDto } from '../domains/auth/dto/login.dto';
import { SignupDto } from '../domains/auth/dto/signup.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticateService } from '../orchestrators/auth/login/login.service';
import type { AuthResult } from '../orchestrators/auth/dto/auth-result.dto';
import { RegisterService } from '../orchestrators/auth/register/register.service';
import type { PublicUser } from '../domains/users/dto/public-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterService,
    private readonly authenticate: AuthenticateService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<AuthResult> {
    return this.register.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authenticate.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: PublicUser): PublicUser {
    return user;
  }
}
