// import { Module } from '@nestjs/common';
// import { MeetingsService } from './meeting.service';
// import { MeetingsController } from './meeting.controller';
// import { AvailabilityService } from 'src/availability/availability.service';

// @Module({
//   controllers: [MeetingsController],
//   providers: [MeetingsService],
 
// })
// export class MeetingModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingsService } from './meeting.service';
import { MeetingsController } from './meeting.controller';
import { Meeting, MeetingSchema } from './entities/meeting.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meeting.name, schema: MeetingSchema },
    ]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
