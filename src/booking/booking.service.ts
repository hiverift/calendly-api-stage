
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './entities/booking.entity';
import { EventType, EventTypeDocument } from '../event/entities/event.entity';
import { Slot } from '../utils/slot.interface';
import { generateSlots } from '../utils/slot-generator';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<Booking & BookingDocument>,

    @InjectModel(EventType.name)
    private eventModel: Model<EventType & EventTypeDocument>,
  ) {}

  private weekdayMap: Record<string, string> = {
    Sunday: 'Sun',
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
  };

  // Get available slots for a given date
  async getAvailableSlots(slug: string, date: string) {
    const event = await this.eventModel.findOne({ slug });
    if (!event) throw new BadRequestException('Event not found');

    const activeSchedule = event.schedules.find(s => s.isActive);
    if (!activeSchedule) throw new BadRequestException('No active schedule found');

    const requestedDate = new Date(date);
    const dayFull = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayName = this.weekdayMap[dayFull];

    const dayAvailability = activeSchedule.recurring.find(d => d.day === dayName);
    if (!dayAvailability) {
      return { statusCode: 200, message: `No availability on ${dayFull}`, slots: [] };
    }

    const allSlots: Slot[] = generateSlots(
      dayAvailability.slots,
      event.duration,
      date
    );

    // Filter out already booked slots
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const booked = await this.bookingModel.find({
      eventTypeId: event._id,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    const available = allSlots.filter(slot => {
      const slotStart = new Date(slot.startUTC);
      const slotEnd = new Date(slot.endUTC);
      return !booked.some(b => b.startTime < slotEnd && b.endTime > slotStart);
    });

    return {
      statusCode: 200,
      message: 'Available slots retrieved successfully',
      slots: available.map(s => ({
        startTime: s.startUTC,
        endTime: s.endUTC,
        label: s.label,
      })),
    };
  }

  // Book a slot
  async book(dto: CreateBookingDto & {
    eventId: string;
    userId: string;
    name: string;
    email: string;
    startTime: string;
    endTime: string;
    hostId: string;
    answers?: any;
  }) {
    const { eventId, userId, name, email, slot, startTime, endTime, hostId, answers } = dto;

    const event = await this.eventModel.findById(eventId);
    if (!event) throw new BadRequestException('Invalid event');

    const activeSchedule = event.schedules.find(s => s.isActive);
    if (!activeSchedule) throw new BadRequestException('No active schedule');

    const bookingDate = new Date(startTime);
    const dayNameFull = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayName = this.weekdayMap[dayNameFull];

    const dayAvailability = activeSchedule.recurring.find(d => d.day === dayName);
    if (!dayAvailability) throw new BadRequestException(`Bookings not allowed on ${dayNameFull}`);

    const [availStartH, availStartM] = dayAvailability.slots[0].start.split(':').map(Number);
    const [availEndH, availEndM] = dayAvailability.slots[0].end.split(':').map(Number);

    const availStart = new Date(bookingDate);
    availStart.setHours(availStartH, availStartM, 0, 0);

    const availEnd = new Date(bookingDate);
    availEnd.setHours(availEndH, availEndM, 0, 0);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start < availStart || end > availEnd) {
      throw new BadRequestException(
        `Booking time must be between ${dayAvailability.slots[0].start} and ${dayAvailability.slots[0].end}`
      );
    }

    const isBooked = await this.bookingModel.findOne({
      eventTypeId: event._id,
      hostId,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (isBooked) throw new BadRequestException('Slot already booked for this host');

    const booking = await this.bookingModel.create({
      eventTypeId: event._id,
      userId,
      name,
      email,
      slot,
      startTime: start,
      endTime: end,
      hostId,
      answers: answers || {},
    });

    return {
      statusCode: 201,
      message: 'Booking successful',
      result: {
        bookingId: booking._id,
        eventId: booking.eventTypeId,
        userId: booking.userId,
        hostId: booking.hostId,
        name: booking.name,
        email: booking.email,
        slot: booking.slot,
        startTime: booking.startTime,
        endTime: booking.endTime,
        answers: booking.answers,
      },
    };
  }
}
