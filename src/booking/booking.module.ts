import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './entities/booking.entity';
import { EventModule } from 'src/event/event.module';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    EventModule,
  ],
 controllers: [BookingController],

  providers: [BookingService],
  exports: [BookingService, MongooseModule], 
})
export class BookingModule {}
