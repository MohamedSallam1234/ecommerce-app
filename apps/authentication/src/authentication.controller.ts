import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
  Param,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthenticationGuard } from './authentication.guard';
import { User } from '../schemas/user.schema';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(AuthenticationGuard)
  @Get()
  async getHello(@Headers('authorization') token: string) {
    console.log('token', token);
    return await this.authenticationService.getHello();
  }

  @Post('/signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ user: User; token: string }> {
    return await this.authenticationService.signUp(signUpDto);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return await this.authenticationService.login(loginDto);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/forgot-password/:email')
  async sendForgotPassword(@Param('email') email: string): Promise<string> {
    try {
      const isEmailSent =
        await this.authenticationService.sendForgotPassword(email);
      if (isEmailSent) {
        return 'Email sent successfully';
      } else {
        return 'Email not sent';
      }
    } catch (error) {
      console.log('error', error);
      return 'Email not sent';
    }
  }

  @Post('/reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ): Promise<string> {
    try {
      const isPasswordReset = await this.authenticationService.resetPassword(
        token,
        password,
      );
      if (isPasswordReset) {
        return 'Password reset successfully';
      } else {
        return 'Password not reset';
      }
    } catch (error) {
      console.log('error', error);
      return 'Password not reset';
    }
  }
}
