import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [CalendarController],
  providers: [GoogleService, CalendarService],
  exports: [CalendarService, GoogleService],
})
export class GoogleCalendarModule { }
