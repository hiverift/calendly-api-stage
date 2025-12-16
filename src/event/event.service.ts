import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventType } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateBookingDto } from 'src/booking/dto/create-booking.dto';
import { Booking } from 'src/booking/entities/booking.entity';
import { Types } from 'mongoose';

const slugify = require('slugify');



@Injectable()
export class EventTypesService {
  // bookingModel: any;


  constructor(
    @InjectModel(EventType.name)
    private eventModel: Model<EventType>,
    // export type EventTypeDocument = EventType & Document;

    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) { }


  
//   async bookEvent(eventId: string, dto: CreateBookingDto, userId: string) {
//   const event = await this.eventModel.findById(eventId);
//   if (!event) throw new NotFoundException('Event not found');

//   const bookingDate = new Date(dto.startTime);
//   const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });

//   // Check weekly availability
//   const weeklySlot = event.weeklyAvailability.find(
//     w => w.day === dayName &&
//          dto.startTime.slice(11,16) >= w.start &&
//          dto.endTime.slice(11,16) <= w.end
//   );

//   // Check single-day availability
//   const singleSlot = event.singleDayAvailability?.find(
//     s => s.date.toString().slice(0,10) === dto.startTime.slice(0,10) &&
//          dto.startTime.slice(11,16) >= s.start &&
//          dto.endTime.slice(11,16) <= s.end
//   );

//   if (!weeklySlot && !singleSlot) {
//     throw new BadRequestException('Selected slot is not available');
//   }

//   // Check if max bookings per day exceeded
//   const bookingsCount = await this.bookingModel.countDocuments({
//     eventTypeId: eventId,
//     startTime: {
//       $gte: new Date(dto.startTime).setHours(0,0,0,0),
//       $lt: new Date(dto.startTime).setHours(23,59,59,999)
//     }
//   });

//   if (event.maxBookingsPerDay && bookingsCount >= event.maxBookingsPerDay) {
//     throw new BadRequestException('Maximum bookings reached for this day');
//   }

//   // Save booking
//   const booking = await this.bookingModel.create({
//     ...dto,
//     eventTypeId: eventId,
//     userId
//   });

//   return {
//     statusCode: 201,
//     message: "Booking successful",
//     result: { booking },
//   };
// }
async bookEvent(eventId: string, dto: CreateBookingDto, userId: string) {
  const event = await this.eventModel.findById(eventId);
  if (!event) throw new NotFoundException('Event not found');

  const startTime = new Date(dto.startTime);
  const endTime = new Date(dto.endTime);

  // 1️⃣ Check slot conflict (MOST IMPORTANT)
  const conflict = await this.bookingModel.findOne({
    eventTypeId: eventId,
    startTime: startTime,
  });

  if (conflict) {
    throw new BadRequestException('This slot is already booked');
  }

  // 2️⃣ Max bookings per day
  const dayStart = new Date(startTime);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(startTime);
  dayEnd.setHours(23, 59, 59, 999);

  const bookingsCount = await this.bookingModel.countDocuments({
    eventTypeId: eventId,
    startTime: { $gte: dayStart, $lte: dayEnd },
  });

  if (event.maxBookingsPerDay && bookingsCount >= event.maxBookingsPerDay) {
    throw new BadRequestException('Maximum bookings reached for this day');
  }

  // 3️⃣ Save booking
  const booking = await this.bookingModel.create({
    ...dto,
    eventTypeId: eventId,
    userId,
  });

  return {
    statusCode: 201,
    message: 'Booking successful',
    result: booking,
  };
}



// async create(dto: CreateEventDto, userId: string) {
//   const slug = slugify(dto.title, { lower: true }) + '-' + Date.now();

//   const eventData: any = {
//     ...dto,
//     userId,
//     slug,
//   };

//   // Save event
//   const newEvent = new this.eventModel(eventData);
//   const savedEvent = await newEvent.save();

//   return {
//     statusCode: 201,
//     message: "Event type created successfully",
//     result: savedEvent,
//   };
// }
async create(dto: CreateEventDto, userId: string) {
  const slug = slugify(dto.title, { lower: true }) + '-' + Date.now();

  // 🔥 DEFAULT CALENDLY-LIKE AVAILABILITY
  const defaultSchedule = {
    _id: new Types.ObjectId().toHexString(),
    name: 'Working hours',
    isActive: true,
    recurring: [
      {
        _id: new Types.ObjectId().toHexString(),
        day: 'Monday',
        slots: [{ start: '09:00', end: '17:00' }],
      },
      {
        _id: new Types.ObjectId().toHexString(),
        day: 'Tuesday',
        slots: [{ start: '09:00', end: '17:00' }],
      },
      {
        _id: new Types.ObjectId().toHexString(),
        day: 'Wednesday',
        slots: [{ start: '09:00', end: '17:00' }],
      },
      {
        _id: new Types.ObjectId().toHexString(),
        day: 'Thursday',
        slots: [{ start: '09:00', end: '17:00' }],
      },
      {
        _id: new Types.ObjectId().toHexString(),
        day: 'Friday',
        slots: [{ start: '09:00', end: '17:00' }],
      },
    ],
    dateOverrides: [],
  };

  const eventData: any = {
    ...dto,
    userId,
    slug,
    schedules: [defaultSchedule], 
  };

  const newEvent = new this.eventModel(eventData);
  const savedEvent = await newEvent.save();

  return {
    statusCode: 201,
    message: 'Event created with default availability',
    result: savedEvent,
  };
}


// copy link
async generateShareLink(id: string) {
  const event = await this.eventModel.findById(id);
  if (!event) throw new NotFoundException('Event not found');

  // Frontend URL (where users will join the event)
  const baseUrl = process.env.FRONTEND_URL || 'http://192.168.0.238:5173';

  // Shareable link
  const shareUrl = `${baseUrl}/join-event/${event._id}`;

  return {
    statusCode: 200,
    message: 'Shareable link generated successfully',
    result: { shareUrl },
  };
}



  //slot
  async findBySlug(slug: string) {
    return this.eventModel.findOne({ slug });
  }

 
async findAll() {
  return this.eventModel.find().lean()
  .sort({ createdAt: -1 });
}

async findbyUserId(id:any) {
  const updatedEvent = await this.eventModel.find({userId:id}).lean()
  .sort({ createdAt: -1 });
  return {
    statusCode: 200,
    message: "Event status toggled successfully",
    result: { event: updatedEvent },
  };
}



  //find one
  async findOne(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new BadRequestException('Event not found');
    return event;
  }
 
  async update(id: string, dto: UpdateEventDto, userId: string, userRole: string) {
  const event = await this.eventModel.findById(id);
  if (!event) throw new BadRequestException('Event not found');

  // Check permission
  if (userRole !== 'admin' && event.userId.toString() !== userId) {
    throw new UnauthorizedException('You cannot edit this event');
  }

  Object.assign(event, dto);
  const updatedEvent = await event.save();

  return {
    statusCode: 200,
    message: "Event updated successfully",
    result: { event: updatedEvent },
  };
}

async toggleEvent(id: string, userId: string, userRole: string) {
  const event = await this.eventModel.findById(id);
  if (!event) throw new BadRequestException('Event not found');

  if (userRole !== 'admin' && event.userId.toString() !== userId) {
    throw new UnauthorizedException('You cannot toggle this event');
  }

  event.isActive = !event.isActive;
  const updatedEvent = await event.save();

  return {
    statusCode: 200,
    message: "Event status toggled successfully",
    result: { event: updatedEvent },
  };
}

async delete(id: string, userId: string, userRole: string) {
  const event = await this.eventModel.findById(id);
  if (!event) throw new BadRequestException('Event not found');

  if (userRole !== 'admin' && event.userId.toString() !== userId) {
    throw new UnauthorizedException('You cannot delete this event');
  }

  await this.eventModel.findByIdAndDelete(id);

  return {
    statusCode: 200,
    message: 'Event deleted successfully',
    result: null,
  };
}

async duplicate(id: string, userId: string, userRole: string) {
  const original = await this.eventModel.findById(id);
  if (!original) throw new NotFoundException('Event not found');

  if (userRole !== 'admin' && original.userId.toString() !== userId) {
    throw new UnauthorizedException('You cannot duplicate this event');
  }

  const copy = new this.eventModel({
    ...original.toObject(),
    _id: undefined,
    slug: slugify(original.title + '-copy', { lower: true }) + '-' + Date.now(),
    userId,
    createdAt: undefined,
    updatedAt: undefined,
  });

  const duplicatedEvent = await copy.save();
  return {
    statusCode: 201,
    message: "Event duplicated successfully",
    result: { event: duplicatedEvent },
  };
}

}
