
// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { GoogleStrategy } from './google.strategy';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { UserModule } from 'src/user/user.module';
// import { JwtStrategy } from './guards/jwt.strategy';

// @Module({
//   imports: [
//     PassportModule,
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'lokesh123',
//       signOptions: { expiresIn: '7d' },
//     }),
//     UserModule,
//   ],
//   providers: [
//     AuthService,
//     GoogleStrategy,
//     JwtStrategy,
//   ],
//   controllers: [AuthController],
// })
// export class AuthModule {}
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './guards/jwt.strategy';  
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { GoogleService } from '../google/google.service';
import { GoogleController } from 'src/google/google.Controller';
import { GoogleModule } from 'src/google/google.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lokesh123',
      signOptions: { expiresIn: '7d' },
    }),
    UserModule,
    GoogleModule,
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy, 
    
  ],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy],  
})
export class AuthModule {}
