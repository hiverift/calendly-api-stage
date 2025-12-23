import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { EventModule } from './event/event.module';

import { BookingModule } from './booking/booking.module';
import { MeetingsModule } from './meeting/meeting.module';
import { ScheduleModule } from './schedule/schedule.module';
// import { AvailableModule } from './available/available.module';
import { AvailabilityModule } from './available/available.module';
import { GoogleModule } from './google/google.module';
import { SlotsModule } from './slots/slots.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';

import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // exclude: ['/api'],
    // //  ServeStaticModule.forRoot({
    // //    rootPath: join(__dirname, '..', 'public'),

    //   exclude: ['/api'],

    // }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    UserModule,
    EventModule,
    
    BookingModule,
    MeetingsModule,
    ScheduleModule,
    AvailabilityModule,
    GoogleModule,
    SlotsModule,
    GoogleCalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
