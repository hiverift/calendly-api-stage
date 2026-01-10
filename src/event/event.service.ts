import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventType } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateBookingDto } from 'src/booking/dto/create-booking.dto';
import { Booking } from 'src/booking/entities/booking.entity';
import { Types } from 'mongoose';
import { DateTime } from 'luxon';


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
  private slotToUTC(date: string, time: string, tz: string) {
    return DateTime
      .fromISO(`${date}T${time}`, { zone: tz })
      .toUTC()
      .toJSDate();
  }
  async bookEvent(eventId: string, dto: CreateBookingDto) {
    dto.bookingSource = 'public';

    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    let startTime: Date;
    let endTime: Date;

    /**
     * CASE 1: Frontend sends ISO datetime
     * Example: 2026-01-03T11:00:00+05:30
     */
    if (dto.startTime?.includes('T')) {
      const start = DateTime.fromISO(dto.startTime);
      const end = DateTime.fromISO(dto.endTime);

      if (!start.isValid || !end.isValid) {
        throw new BadRequestException('Invalid startTime or endTime');
      }

      startTime = start.toUTC().toJSDate();
      endTime = end.toUTC().toJSDate();

      // Auto-derive date if not sent
      if (!dto.date) {
        dto.date = start.toISODate();
      }
    }

    
    else {
      if (!dto.date) {
        throw new BadRequestException(
          'date is required when using time-only format',
        );
      }

      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException('startTime and endTime are required');
      }

      // Now TypeScript KNOWS these are strings
      startTime = this.slotToUTC(dto.date, dto.startTime, event.timezone);
      endTime = this.slotToUTC(dto.date, dto.endTime, event.timezone);
    }

    /**
     * Conflict check
     */
    const conflict = await this.bookingModel.findOne({
      eventTypeId: eventId,
      startTime,
    });

    if (conflict) {
      throw new BadRequestException('This slot is already booked');
    }

    /**
     * Daily booking limit
     */
    const dayStart = new Date(startTime);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(startTime);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const bookingsCount = await this.bookingModel.countDocuments({
      eventTypeId: eventId,
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    if (event.maxBookingsPerDay && bookingsCount >= event.maxBookingsPerDay) {
      throw new BadRequestException('Maximum bookings reached for this day');
    }

    /**
     * Create booking
     */
    const booking = await this.bookingModel.create({
      ...dto,
      eventTypeId: eventId,
      startTime,
      endTime,
    });

    return {
      statusCode: 201,
      message: 'Booking successful',
      result: booking,
    };
  }


  // async bookEvent(eventId: string, dto: CreateBookingDto) {
  //   dto.bookingSource = 'public';

  //   const event = await this.eventModel.findById(eventId);
  //   if (!event) throw new NotFoundException('Event not found');

  //   const startTime = this.slotToUTC(dto.date, dto.startTime, event.timezone);
  //   const endTime = this.slotToUTC(dto.date, dto.endTime, event.timezone);

  //   const conflict = await this.bookingModel.findOne({
  //     eventTypeId: eventId,
  //     startTime,
  //   });

  //   if (conflict) {
  //     throw new BadRequestException('This slot is already booked');
  //   }

  //   const dayStart = new Date(startTime);
  //   dayStart.setUTCHours(0, 0, 0, 0);

  //   const dayEnd = new Date(startTime);
  //   dayEnd.setUTCHours(23, 59, 59, 999);

  //   const bookingsCount = await this.bookingModel.countDocuments({
  //     eventTypeId: eventId,
  //     startTime: { $gte: dayStart, $lte: dayEnd },
  //   });

  //   if (event.maxBookingsPerDay && bookingsCount >= event.maxBookingsPerDay) {
  //     throw new BadRequestException('Maximum bookings reached for this day');
  //   }

  //   const booking = await this.bookingModel.create({
  //     ...dto,
  //     eventTypeId: eventId,
  //     startTime,
  //     endTime,
  //   });

  //   return {
  //     statusCode: 201,
  //     message: 'Booking successful',
  //     result: booking,
  //   };
  // }


  //create
  async create(dto: CreateEventDto, userId: string) {
    const slug = slugify(dto.title, { lower: true }) + '-' + Date.now();

    //  DEFAULT  AVAILABILITY
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

    // Frontend URL 
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

  // async findbyUserId(id: any) {
  //   const updatedEvent = await this.eventModel.find({ userId: id }).lean()
  //     .sort({ createdAt: -1 });
  //   return {
  //     statusCode: 200,
  //     message: "Event status toggled successfully",
  //     result: { event: updatedEvent },
  //   };
  // }
  async findByUserId(userId: string) {
    const events = await this.eventModel
      .find({ userId })
      .lean()
      .sort({ createdAt: -1 });

    return {
      statusCode: 200,
      message: 'User events fetched successfully',
      result: events,
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
  // Toggle event
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
  // Delete
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
  // Duplicate
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
