
import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { GoogleService } from '../google-calendar/google.service';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService, 
  ) {}

  /* ───────────────── GOOGLE OAUTH LOGIN ───────────────── */

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res: express.Response) {
    if (!req.user) {
      return res.status(401).send('Google login failed');
    }

    const jwt = this.authService.generateToken(req.user);

    return res.redirect(
      `${process.env.GOOGLE_SUCCESS_REDIRECT}?token=${jwt}`,
    );
  }

  @Get('success')
  async googleSuccess(@Query('token') token: string) {
    if (!token) {
      return { success: false, message: 'Token is missing' };
    }

    try {
      const user = this.authService.validateGoogleUser(token);
      return {
        success: true,
        message: 'Google login successful',
        user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  /* ───────────────── ACCESS TOKEN API (IMPORTANT) ───────────────── */
  
  @Get('google/access-token')
  async getGoogleAccessToken() {
    const accessToken = await this.googleService.getAccessToken();

    return {
      statusCode: 200,
      accessToken,
      expiresIn: 3600,
    };
  }

  /* ───────────────── NORMAL AUTH ───────────────── */

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /* ───────────────── GOOGLE EMAIL OTP LOGIN ───────────────── */

  @Post('google/request')
  googleRequest(@Body('email') email: string) {
    return this.authService.googleEmailRequest(email);
  }

  @Post('google/verify')
  googleVerify(@Body() body: { email: string; otp: string }) {
    return this.authService.googleEmailVerify(body.email, body.otp);
  }

  /* ───────────────── TEST ROUTE ───────────────── */

  @Get('google/test')
  async testGoogleLogin(@Query('email') email: string) {
    return this.authService.googleTestLogin(email);
  }
}
