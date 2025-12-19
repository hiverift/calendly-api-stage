// import { Controller, Post, Body, Query, Get } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   // REGISTER
//   @Post('register')
//   register(@Body() dto: RegisterDto) {
//     return this.authService.register(dto);
//   }

//   // LOGIN
//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.authService.login(dto.email, dto.password);
//   }

//   // FORGOT PASSWORD
//   @Post('forgot-password')
//   forgotPassword(@Body() dto: ForgotPasswordDto) {
//     return this.authService.forgotPassword(dto.email);
//   }

//   // RESET PASSWORD
//   @Post('reset-password')
//   resetPassword(@Body() dto: ResetPasswordDto) {
//     return this.authService.resetPassword(dto.token, dto.newPassword);
//   }
//    @Get('google/test')
//   async testGoogleLogin(@Query('email') email: string) {
//     return this.authService.googleTestLogin(email);
//   }

// }
// // import { Controller, Post, Body, Query, Get } from '@nestjs/common';
// // import { AuthService } from './auth.service';
// // import { RegisterDto } from './dto/register.dto';
// // import { LoginDto } from './dto/login.dto';
// // import { ForgotPasswordDto } from './dto/forgot-password.dto';
// // import { ResetPasswordDto } from './dto/reset-password.dto';

// // @Controller('auth')
// // export class AuthController {
// //   constructor(private readonly authService: AuthService) {}


// //   // REGISTER OTP FLOW


// //   // Send OTP for register
// //   @Post('send-otp-register')
// //   sendRegisterOtp(@Body('email') email: string) {
// //     return this.authService.sendRegisterOtp(email);
// //   }

// //   // Verify OTP and complete registration
// //   @Post('verify-register')
// //   verifyRegisterOtp(@Body() dto: RegisterDto & { otp: string }) {
// //     return this.authService.verifyRegisterOtp(dto);
// //   }


// //   // LOGIN OTP FLOw

// //   //  Login with email & password → send OTP
// //   @Post('login')
// //   login(@Body() dto: LoginDto) {
// //     return this.authService.login(dto);
// //   }

// //   //Verify OTP → return JWT
// //   @Post('verify-login-otp')
// //   verifyLoginOtp(
// //     @Body('email') email: string,
// //     @Body('otp') otp: string,
// //   ) {
// //     return this.authService.verifyLoginOtp(email, otp);
// //   }


// //   // FORGOT / RESET PASSWORD


// //   @Post('forgot-password')
// //   forgotPassword(@Body() dto: ForgotPasswordDto) {
// //     return this.authService.forgotPassword(dto.email);
// //   }

// //   @Post('reset-password')
// //   resetPassword(@Body() dto: ResetPasswordDto) {
// //     return this.authService.resetPassword(dto.token, dto.newPassword);
// //   }


// //   // GOOGLE TEST LOGIN

// //   @Get('google/test')
// //   async testGoogleLogin(@Query('email') email: string) {
// //     return this.authService.googleTestLogin(email);
// //   }
// // }
import { Controller, Post, Body, Query, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import express from 'express';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  // @Get('google')
  // @UseGuards(GoogleAuthGuard)
  // async googleLogin() {
  //   return;
  // }

  // // STEP 2 → Google redirects back to your callback
  // @Get('google/callback')
  // @UseGuards(GoogleAuthGuard)
  // async googleCallback(@Req() req, @Res() res: express.Response) {
  //   const token = req.user ? req.user : null; // user returned from validate()

  //   const jwt = this.authService.generateToken(req.user);

  //   return res.redirect(
  //     `${process.env.GOOGLE_SUCCESS_REDIRECT}?token=${jwt}`
  //   );
  // }
@Get('google')
@UseGuards(GoogleAuthGuard)
async googleLogin() {
  return; // triggers redirect to Google
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleCallback(@Req() req, @Res() res: express.Response) {
   console.log('incoming from req',req,res)
  if (!req.user) return res.status(401).send('Google login failed');
  const jwt = this.authService.generateToken(req.user);
  console.log('jwt token ', jwt)
  console.log('process success url', process.env.GOOGLE_SUCCESS_REDIRECT)
  return res.redirect(`${process.env.GOOGLE_SUCCESS_REDIRECT}?token=${jwt}`);
}


@Get('success')
async googleSuccess(@Query('token') token: string) {
  if (!token) {
    return { success: false, message: 'Token is missing' };
  }

  try {
    const user = this.authService.validateGoogleUser(token);
    console.log('verify with google jwt',user)
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


  //  REGISTER

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
 

  // MANUAL LOGIN

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }


  // FORGOT PASSWORD

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }


  // RESET PASSWORD

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }


  // GOOGLE EMAIL LOGIN — SEND OTP

  @Post('google/request')
  googleRequest(@Body('email') email: string) {
    return this.authService.googleEmailRequest(email);
  }


  // GOOGLE EMAIL LOGIN — VERIFY OTp
  @Post('google/verify')
  googleVerify(@Body() body: { email: string; otp: string }) {
    return this.authService.googleEmailVerify(body.email, body.otp);
  }
  // TEST GOOGLE LOGIN (your old test route)
// @Get('google/callback')
//   async googleCallback(@Query('code') code: string) {
//     return this.authService.googleCallback(code);
//   }
  @Get('google/test')
  async testGoogleLogin(@Query('email') email: string) {
    return this.authService.googleTestLogin(email);
  }
}
