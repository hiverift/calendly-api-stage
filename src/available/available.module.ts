import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Availability,
  AvailabilitySchema,
} from './entities/available.entity';
import { AvailabilityService } from './available.service';
import { AvailabilityController } from './available.controller';
import {GoogleCalendarModule  } from '../google-calendar/google-calendar.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
   
    ]),
   GoogleCalendarModule ,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
