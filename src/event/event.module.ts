import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventTypesController } from './event.controller';
import { EventTypesService } from './event.service';
import { EventType, EventTypeSchema } from './entities/event.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BookingModule } from 'src/booking/booking.module';
import { Booking, BookingSchema } from 'src/booking/entities/booking.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventType.name, schema: EventTypeSchema },
      { name: Booking.name, schema: BookingSchema }, 
    ]),
    
    AuthModule
  ],
  controllers: [EventTypesController],
  providers: [EventTypesService],
  exports: [EventTypesService,MongooseModule],
})
export class EventModule {}
  