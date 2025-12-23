import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../user/entities/user.entity';
import { GoogleService } from '../google/google.service';
import { sendEmailOtp } from './mail.util';


@Injectable()
export class AuthService {

  userModel: any;
  googleService: any;

  constructor(
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) { }
  async googleEmailRequest(email: string) {
    let user = await this.userService.findByEmailUser(email);

    // If no user → auto signup with google provider
    if (!user) {
      user = await this.userService.create({
        name: 'Google User',
        email,
        provider: 'google',
        role: 'user',
        password: '',
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.userService.update(user._id.toString(), {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendEmailOtp(email, otp);

    return {
      statusCode: 200,
      message: 'OTP sent to your email',
      result: {
        email,
        // provider: user.provider ?? 'manual',
      },
    };
  }

  async googleEmailVerify(email: string, otp: string) {
    const user = await this.userService.findByEmailUser(email);
    if (!user) throw new BadRequestException('No user found');

    if (!user.otp || user.otp !== otp)
      throw new BadRequestException('Invalid OTP');

    if (user.otpExpires < new Date())
      throw new BadRequestException('OTP expired, request again');

    // Clear OTP
    await this.userService.update(user._id.toString(), {
      otp: null,
      otpExpires: null,
    });

    // Create JWT
    const token = this.jwt.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      statusCode: 200,
      message: 'Google login successful',
      result: {
        access_token: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          provider: user.provider,
          role: user.role,
        },
      },
    };
  }


  async register(dto: RegisterDto) {

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }


    const exist = await this.userService.findByEmailUser(dto.email);
    if (exist) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    //  Create user
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
    });

    //  Remove password before returning
    const { password, ...safeUser } = user;

    return {
      statusCode: 201,
      message: 'Account created successfully',
      result: safeUser,
    };
  }


  async login(email: string, password: string) {
    const user = await this.userService.findByEmailUser(email);
    if (!user) throw new UnauthorizedException('User not found');

    // If user registered via Google → block manual login
    if (user.provider === 'google') {
      throw new BadRequestException(
        'This email is registered with Google. Please use Google login.'
      );
    }

    // If password is missing
    if (!user.password) {
      throw new UnauthorizedException('Password not set for this account.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      statusCode: 200,
      message: 'Login successful',
      result: {
        access_token: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
  async validateGoogleUser(profile: any) {
    const { id, displayName, emails, photos } = profile;

    // look for user with this google id
    let user = await this.userService.findByGoogleId(id);

    if (!user) {
      user = await this.userService.create({
        googleId: id,
        name: displayName,
        email: emails[0].value,
        avatar: photos?.[0]?.value || null,
        provider: 'google',
        password: '',
        role: 'user',
      });
    }

    return user;
  }

  generateToken(user: any) {
    console.log('user get info', user)
    return this.jwt.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }


  // forgot password
  async forgotPassword(email: string) {
    const user = (await this.userService.findByEmailUser(email)) as UserDocument;
    if (!user) throw new BadRequestException('No user found');

    const token = this.jwt.sign({ id: user._id.toString() }, { expiresIn: '10m' });

    return {
      statusCode: 200,
      message: 'Reset link sent to your email',
      result: { token },
    };
  }
  // reset password
  async resetPassword(token: string, newPassword: string) {
    let payload: { id: string };

    try {
      payload = this.jwt.verify(token) as { id: string };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Token has expired. Please request a new reset link.',
        );
      } else if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token. Please check your reset link.');
      } else {
        throw new BadRequestException('Could not process token.');
      }
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.userService.update(payload.id, { password: hash });

    return {
      statusCode: 200,
      message: 'Password reset successful',
    };
  }
  async googleCallback(code: string) {
    const oauthClient = this.googleService.getClient();

    const { tokens } = await oauthClient.getToken(code);

    // Abhi sirf test ke liye
    console.log('GOOGLE TOKENS ', tokens);

    return tokens;
  }
  // google test login
  async googleTestLogin(email: string) {
    let user = await this.userService.findByEmailUser(email);

    if (!user) {
      user = await this.userService.create({
        name: 'Google Test User',
        email,
        provider: 'google',
        role: 'user',
        password: '',
      });
    }

    const token = this.jwt.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      statusCode: 200,
      message: 'Google test login successful',
      result: {
        access_token: token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          provider: user.provider,
          role: user.role,
        }
      }
    };
  }

}
