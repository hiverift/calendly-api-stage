import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingsService } from './meeting.service';
import { MeetingsController } from './meeting.controller';
import { Meeting, MeetingSchema } from './entities/meeting.entity';
import { Booking, BookingSchema } from 'src/booking/entities/booking.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import { Slot, SlotSchema } from 'src/slots/entities/slot.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meeting.name, schema: MeetingSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Slot.name, schema: SlotSchema },
    ]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService], 
  exports: [MeetingsService,MongooseModule],
})
export class MeetingsModule {}
