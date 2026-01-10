import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './entities/booking.entity';
import { BookingController } from './booking.controller';
import { EventType, EventTypeSchema } from 'src/event/entities/event.entity';
import { EventModule } from 'src/event/event.module';
import { MeetingsModule } from 'src/meeting/meeting.module'; // ✅

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: EventType.name, schema: EventTypeSchema },
    ]),
    EventModule,
    MeetingsModule, // ✅ THIS FIXES EVERYTHING
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
