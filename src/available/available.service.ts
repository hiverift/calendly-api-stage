
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Availability, Slot } from './entities/available.entity';
import { CreateAvailabilityDto } from './dto/create-available.dto';

export interface AvailabilityResponse {
  id: Types.ObjectId;
  name: string;
  date: Date;
  day: string;
  slots: { start: string; end: string }[];
  timezone: string;
  createdAt: Date;
}

type AvailabilityDocument = Availability & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
  ) {}

  // Returns day of week in UTC
  private getDayUTC(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  }

  // Create or update availability
  async create(
    dto: CreateAvailabilityDto,
    userId: string, // string is fine
  ): Promise<AvailabilityResponse | AvailabilityResponse[]> {
    const dates = dto.dates?.length ? dto.dates : dto.date ? [dto.date] : [];
    if (!dates.length) throw new BadRequestException('Date or dates are required');

    let scheduleObjectId: Types.ObjectId;
    try {
      scheduleObjectId = new Types.ObjectId(dto.scheduleId);
    } catch {
      throw new BadRequestException('Invalid scheduleId format');
    }

    const results: AvailabilityResponse[] = [];

    for (const date of dates) {
      // Force UTC midnight
      const dateObj = new Date(date);
      dateObj.setUTCHours(0, 0, 0, 0);

      const day = this.getDayUTC(dateObj);
      const name = dto.name || `Availability ${date}`;

      const slots: Slot[] = dto.slots.map(slot => ({
        start: slot.start,
        end: slot.end,
      }));

      let availability = await this.availabilityModel.findOne({
        userId: new Types.ObjectId(userId),
        scheduleId: scheduleObjectId,
        date: dateObj,
      });

      if (availability) {
        availability.name = name;
        availability.day = day;
        availability.slots = slots;
        availability.timezone = dto.timezone || 'UTC';
        availability.date = dateObj;
      } else {
        availability = new this.availabilityModel({
          userId: new Types.ObjectId(userId),
          scheduleId: scheduleObjectId,
          name,
          date: dateObj,
          day,
          slots,
          timezone: dto.timezone || 'UTC',
        });
      }

      await availability.save();

      results.push({
        id: availability._id,
        name: availability.name,
        date: availability.date,
        day: availability.day,
        slots: availability.slots,
        timezone: availability.timezone,
        createdAt: availability.createdAt,
      });
    }

    return results.length === 1 ? results[0] : results;
  }

  // Get availability by schedule
  async getByScheduleId(scheduleId: string, userId: string) {
    if (!scheduleId) throw new BadRequestException('scheduleId is required');

    let scheduleObjectId: Types.ObjectId;
    try {
      scheduleObjectId = new Types.ObjectId(scheduleId);
    } catch {
      throw new BadRequestException('Invalid scheduleId format');
    }

    return this.availabilityModel
      .find(
        { scheduleId: scheduleObjectId, userId: new Types.ObjectId(userId) },
        { _id: 1, name: 1, date: 1, day: 1, slots: 1, timezone: 1, createdAt: 1 },
      )
      .sort({ date: 1 })
      .lean()
      .exec();
  }

  // Get availability by month
  async getByMonth(month: string, userId: string, scheduleId?: string) {
    const [year, monthNum] = month.split('-').map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12)
      throw new BadRequestException('Invalid month format. Use YYYY-MM');

    // Start and end dates in UTC
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const filter: any = {
      userId: new Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    };
    if (scheduleId) filter.scheduleId = new Types.ObjectId(scheduleId);

    console.log('Month Filter (UTC):', filter);

    const data = await this.availabilityModel
      .find(filter, { date: 1, name: 1, day: 1, slots: 1, timezone: 1 })
      .sort({ date: 1 })
      .lean();

    return data.map(item => ({
      date: item.date.toISOString().split('T')[0], // YYYY-MM-DD
      name: item.name,
      day: item.day,
      slots: item.slots,
      timezone: item.timezone,
    }));
  }
}
