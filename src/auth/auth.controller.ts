import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './providers/auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { UpdateMobileDto } from './dtos/update-mobile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    /*
     * Injecting Auth Service
     */
    private readonly authService: AuthService,
  ) {}

  // @Post('sign-in')
  // @HttpCode(HttpStatus.OK)
  // public signIn(@Body() signInDto: SignInDto) {
  //   return this.authService.signIn(signInDto);
  // }

  @Post('sign-up')
  public signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('verify-otp-and-create-user')
  public verifyOtpAndCreateUser(
    @Body()
    {
      email,
      otp,
      signupDto,
    }: {
      email: string;
      otp: string;
      signupDto: SignupDto;
    },
  ) {
    return this.authService.verifyOtpAndCreateUser(email, otp, signupDto);
  }

  @Post('forgot-password')
  public forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  public resetPassword(
    @Body()
    {
      email,
      otp,
      newPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.authService.resetPassword(email, otp, newPassword);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('update-mobile')
  async updateMobile(
    @Req() req: any,
    @Body() updateMobileDto: UpdateMobileDto,
  ) {
    const userId = req.user.sub;
    return this.authService.updateMobile(userId, updateMobileDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('test')
  public test() {
    return { hello: 1 };
  }
}
