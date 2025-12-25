import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Availability,
  AvailabilitySchema,
} from './entities/available.entity';
import { AvailabilityService } from './available.service';
import { AvailabilityController } from './available.controller';
import {GoogleCalendarModule  } from '../google-calendar/google-calendar.module'; 
import { Schedule, ScheduleSchema } from 'src/schedule/entities/schedule.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
   
    ]),
      MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }]),
   GoogleCalendarModule ,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
