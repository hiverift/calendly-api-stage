
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Availability, Slot } from './entities/available.entity';
import { CreateAvailabilityDto } from './dto/create-available.dto';
import { CalendarService } from '../google-calendar/calendar.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<Availability>,
    private googleCalendarService: CalendarService,
  ) {}

  /* -------------------- HELPERS -------------------- */

  private getDayUTC(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    });
  }

  private isOverlapping(
    slot: { start: string; end: string },
    busy: { start: string; end: string },
  ): boolean {
    return slot.start < busy.end && slot.end > busy.start;
  }

  /* -------------------- CREATE -------------------- */

  async create(dto: CreateAvailabilityDto, userId: string) {
    const dates = dto.dates?.length ? dto.dates : dto.date ? [dto.date] : [];
    if (!dates.length) {
      throw new BadRequestException('Date or dates are required');
    }

    const scheduleObjectId = new Types.ObjectId(dto.scheduleId);
    const results: Availability[] = [];


    for (const date of dates) {
      const dateObj = new Date(date);
      dateObj.setUTCHours(0, 0, 0, 0);

      const availability = await this.availabilityModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          scheduleId: scheduleObjectId,
          date: dateObj,
        },
        {
          $set: {
            name: dto.name || `Availability ${date}`,
            date: dateObj,
            day: this.getDayUTC(dateObj),
            slots: dto.slots,
            timezone: dto.timezone || 'UTC',
          },
        },
        { upsert: true, new: true },
      );

      results.push(availability);
    }

    return results.length === 1 ? results[0] : results;
  }

  async getByScheduleId(scheduleId: string, userId: string) {
  if (!scheduleId) {
    throw new BadRequestException('scheduleId is required');
  }

  const scheduleObjectId = new Types.ObjectId(scheduleId);

  return this.availabilityModel
    .find(
      {
        scheduleId: scheduleObjectId,
        userId: new Types.ObjectId(userId),
      },
      {
        _id: 1,
        name: 1,
        date: 1,
        day: 1,
        slots: 1,
        timezone: 1,
        createdAt: 1,
      },
    )
    .sort({ date: 1 })
    .lean();
}


  /* -------------------- GET BY MONTH (    MAIN LOGIC) -------------------- */

  async getByMonth(
    month: string,
    userId: string,
    scheduleId?: string,
    useGoogleCalendar = false,
    eventId?: string,
  ) {
    const [year, monthNum] = month.split('-').map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM');
    }

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const filter: any = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (userId) filter.userId = new Types.ObjectId(userId);
    if (scheduleId) filter.scheduleId = new Types.ObjectId(scheduleId);
    if (eventId) filter.eventId = new Types.ObjectId(eventId);

    const data = await this.availabilityModel
      .find(filter, { date: 1, name: 1, day: 1, slots: 1, timezone: 1 })
      .sort({ date: 1 })
      .lean();

    /* -------- GOOGLE CALENDAR BUSY SLOTS -------- */

    let googleBusy: { start: string; end: string }[] = [];

    if (useGoogleCalendar) {
      try {
        googleBusy = await this.googleCalendarService.getBusySlots(
          startDate.toISOString(),
          endDate.toISOString(),
        );
      } catch {
        console.warn('Google Calendar unavailable, using DB only');
      }
    }

    /* -------- BUILD AVAILABILITY MAP ( FIX) -------- */

    const availabilityMap = new Map<string, any>();

    for (const item of data) {
      const dateKey = item.date.toISOString().split('T')[0];

      if (!availabilityMap.has(dateKey)) {
        availabilityMap.set(dateKey, {
          date: dateKey,
          name: item.name,
          day: item.day,
          timezone: item.timezone,
          slots: [],
        });
      }

      availabilityMap.get(dateKey).slots.push(
        ...item.slots.map((slot) => ({
          start: slot.start,
          end: slot.end,
        })),
      );
    }

    /* -------- APPLY GOOGLE BUSY FILTER -------- */

    for (const day of availabilityMap.values()) {
      day.slots = day.slots.filter(
        (slot) =>
          !googleBusy.some((busy) =>
            this.isOverlapping(slot, busy),
          ),
      );
    }

    /* -------- FINAL RESPONSE (ONLY ONE RETURN) -------- */

    return {
      month,
      timezone: 'UTC',
      availability: Array.from(availabilityMap.values()),
    };
  }
}
