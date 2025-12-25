 
// import { Injectable, BadRequestException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { DateTime } from 'luxon';

// import { Availability } from './entities/available.entity';
// import { CreateAvailabilityDto } from './dto/create-available.dto';
// import { CalendarService } from '../google-calendar/calendar.service';
// import { Schedule } from '../schedule/entities/schedule.entity';

// // Interval type
// type Interval = { from: string; to: string };

// @Injectable()
// export class AvailabilityService {
//   constructor(
//     @InjectModel(Availability.name)
//     private availabilityModel: Model<Availability>,
//     @InjectModel(Schedule.name)
//     private scheduleModel: Model<Schedule>,
//     private googleCalendarService: CalendarService,
//   ) {}

//   /* -------------------- HELPERS -------------------- */

//   private getDayByTimezone(date: Date, timezone: string): string {
//     return DateTime.fromJSDate(date, { zone: timezone })
//       .toFormat('cccc')
//       .toLowerCase();
//   }

//   private normalizeDay(day: string): string {
//     return day.toLowerCase();
//   }

//   private emptyWeekRules() {
//     const days = [
//       'sunday',
//       'monday',
//       'tuesday',
//       'wednesday',
//       'thursday',
//       'friday',
//       'saturday',
//     ];
//     return days.map((d) => ({
//       type: 'wday',
//       wday: d,
//       intervals: [] as Interval[],
//     }));
//   }

//   private isOverlapping(
//     slot: { start: string; end: string },
//     busy: { start: string; end: string },
//   ): boolean {
//     return slot.start < busy.end && slot.end > busy.start;
//   }

//   private buildWeeklyRules(data: any[]) {
//     const weekRules = this.emptyWeekRules();
//     const dateRulesMap = new Map<string, Interval[]>();

//     for (const item of data) {
//       const wday = this.normalizeDay(item.day);
//       const intervals: Interval[] = item.slots.map((s) => ({
//         from: s.start,
//         to: s.end,
//       }));

//       // WEEKLY RULE
//       const weekRule = weekRules.find((r) => r.wday === wday);
//       if (weekRule) weekRule.intervals.push(...intervals);

//       // DATE OVERRIDE RULE
//       const dateKey = item.date.toISOString().split('T')[0];
//       if (!dateRulesMap.has(dateKey)) dateRulesMap.set(dateKey, []);
//       dateRulesMap.get(dateKey)!.push(...intervals);
//     }

//     const dateRules = Array.from(dateRulesMap.entries()).map(([date, intervals]) => ({
//       type: 'date',
//       date,
//       intervals,
//     }));

//     return [...weekRules, ...dateRules];
//   }

//   /* -------------------- CREATE -------------------- */
//   async create(dto: CreateAvailabilityDto) {
//     if (!dto.scheduleId) throw new BadRequestException('scheduleId is required');
//     if (!dto.timezone) throw new BadRequestException('timezone is required');

//     // Fetch schedule including userId
//     const schedule = await this.scheduleModel.findById(dto.scheduleId);
//     if (!schedule) throw new BadRequestException('Schedule not found');

//     // const userId = schedule.userId.toString();
//     const scheduleObjectId = new Types.ObjectId(dto.scheduleId);
//     // const userObjectId = new Types.ObjectId(userId);

//     const dates = dto.dates?.length ? dto.dates : dto.date ? [dto.date] : [];
//     if (!dates.length) throw new BadRequestException('Date or dates are required');

//     const results: Availability[] = [];

//     for (const date of dates) {
//       const dateObj = new Date(date);
//       dateObj.setUTCHours(0, 0, 0, 0);

//       const availability = await this.availabilityModel.findOneAndUpdate(
//         { userId: userObjectId, scheduleId: scheduleObjectId, date: dateObj },
//         {
//           $set: {
//             name: dto.name || `Availability ${date}`,
//             date: dateObj,
//             day: this.getDayByTimezone(dateObj, dto.timezone),
//             slots: dto.slots,
//             timezone: dto.timezone,
//           },
//         },
//         { upsert: true, new: true },
//       );

//       results.push(availability);
//     }

//     return results.length === 1 ? results[0] : results;
//   }

//   /* -------------------- GET BY SCHEDULE -------------------- */
//   async getByScheduleId(scheduleId: string) {
//     if (!scheduleId) throw new BadRequestException('scheduleId is required');

//     return this.availabilityModel
//       .find({ scheduleId: new Types.ObjectId(scheduleId) })
//       .sort({ date: 1 })
//       .lean();
//   }

//   /* -------------------- WEEKLY AVAILABILITY -------------------- */
//   async getWeeklyAvailability(scheduleId: string) {
//     const schedule = await this.scheduleModel.findById(scheduleId);
//     if (!schedule) throw new BadRequestException('Schedule not found');

//     const userId = schedule.userId.toString();

//     const data = await this.availabilityModel
//       .find({
//         scheduleId: new Types.ObjectId(scheduleId),
//         userId: new Types.ObjectId(userId),
//       })
//       .sort({ date: 1 })
//       .lean();

//     return {
//       id: Date.now(),
//       name: 'Working hours',
//       owner_id: userId,
//       rules: this.buildWeeklyRules(data),
//       rules_version: null,
//       timezone: data[0]?.timezone || 'UTC',
//     };
//   }

//   /* -------------------- GET BY MONTH -------------------- */
//   async getByMonth(
//     month: string,
//     scheduleId?: string,
//     useGoogleCalendar = false,
//     eventId?: string,
//   ) {
//     if (scheduleId) {
//       const schedule = await this.scheduleModel.findById(scheduleId);
//       if (!schedule) throw new BadRequestException('Schedule not found');

//       const userId = schedule.userId.toString();
//       return this.getMonthAvailability(month, userId, scheduleId, useGoogleCalendar, eventId);
//     }
//     throw new BadRequestException('scheduleId is required');
//   }

//   private async getMonthAvailability(
//     month: string,
//     userId: string,
//     scheduleId?: string,
//     useGoogleCalendar = false,
//     eventId?: string,
//   ) {
//     const [year, monthNum] = month.split('-').map(Number);
//     if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
//       throw new BadRequestException('Invalid month format. Use YYYY-MM');
//     }

//     const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
//     const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

//     const filter: any = {
//       date: { $gte: startDate, $lte: endDate },
//       userId: new Types.ObjectId(userId),
//     };
//     if (scheduleId) filter.scheduleId = new Types.ObjectId(scheduleId);
//     if (eventId) filter.eventId = new Types.ObjectId(eventId);

//     const data = await this.availabilityModel.find(filter).lean();

//     let googleBusy: { start: string; end: string }[] = [];
//     if (useGoogleCalendar) {
//       try {
//         googleBusy = await this.googleCalendarService.getBusySlots(
//           startDate.toISOString(),
//           endDate.toISOString(),
//         );
//       } catch {}
//     }

//     const availabilityMap = new Map<string, any>();
//     for (const item of data) {
//       const dateKey = item.date.toISOString().split('T')[0];
//       if (!availabilityMap.has(dateKey)) {
//         availabilityMap.set(dateKey, {
//           date: dateKey,
//           day: item.day,
//           timezone: item.timezone,
//           slots: [],
//         });
//       }
//       availabilityMap.get(dateKey).slots.push(...item.slots);
//     }

//     for (const day of availabilityMap.values()) {
//       day.slots = day.slots.filter((slot) =>
//         !googleBusy.some((busy) => this.isOverlapping(slot, busy)),
//       );
//     }

//     return { month, timezone: data[0]?.timezone || 'UTC', availability: Array.from(availabilityMap.values()) };
//   }
// }
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DateTime } from 'luxon';

import { Availability } from './entities/available.entity';
import { CreateAvailabilityDto } from './dto/create-available.dto';
import { CalendarService } from '../google-calendar/calendar.service';
import { Schedule } from '../schedule/entities/schedule.entity';

// Interval type
type Interval = { from: string; to: string };

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<Availability>,

    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,

    private readonly googleCalendarService: CalendarService,
  ) {}

  /* -------------------- HELPERS -------------------- */

  private getDayByTimezone(date: Date, timezone: string): string {
    return DateTime.fromJSDate(date, { zone: timezone })
      .toFormat('cccc')
      .toLowerCase();
  }

  private normalizeDay(day: string): string {
    return day.toLowerCase();
  }

  private emptyWeekRules() {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days.map((d) => ({
      type: 'wday',
      wday: d,
      intervals: [] as Interval[],
    }));
  }

  private isOverlapping(
    slot: { start: string; end: string },
    busy: { start: string; end: string },
  ): boolean {
    return slot.start < busy.end && slot.end > busy.start;
  }

  private buildWeeklyRules(data: any[]) {
    const weekRules = this.emptyWeekRules();
    const dateRulesMap = new Map<string, Interval[]>();

    for (const item of data) {
      const wday = this.normalizeDay(item.day);
      const intervals: Interval[] = item.slots.map((s) => ({
        from: s.start,
        to: s.end,
      }));

      const weekRule = weekRules.find((r) => r.wday === wday);
      if (weekRule) weekRule.intervals.push(...intervals);

      const dateKey = item.date.toISOString().split('T')[0];
      if (!dateRulesMap.has(dateKey)) dateRulesMap.set(dateKey, []);
      dateRulesMap.get(dateKey)!.push(...intervals);
    }

    const dateRules = Array.from(dateRulesMap.entries()).map(
      ([date, intervals]) => ({
        type: 'date',
        date,
        intervals,
      }),
    );

    return [...weekRules, ...dateRules];
  }

  /* -------------------- CREATE -------------------- */

  async create(dto: CreateAvailabilityDto) {
    if (!dto.scheduleId)
      throw new BadRequestException('scheduleId is required');
    if (!dto.timezone)
      throw new BadRequestException('timezone is required');

    if (!Types.ObjectId.isValid(dto.scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    const schedule = await this.scheduleModel.findById(dto.scheduleId);
    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    const scheduleObjectId = new Types.ObjectId(dto.scheduleId);

    const dates = dto.dates?.length
      ? dto.dates
      : dto.date
      ? [dto.date]
      : [];

    if (!dates.length) {
      throw new BadRequestException('Date or dates are required');
    }

    const results: Availability[] = [];

    for (const date of dates) {
      const dateObj = new Date(date);
      dateObj.setUTCHours(0, 0, 0, 0);

      const availability = await this.availabilityModel.findOneAndUpdate(
        {
          scheduleId: scheduleObjectId,
          date: dateObj,
        },
        {
          $set: {
            name: dto.name || `Availability ${date}`,
            scheduleId: scheduleObjectId,
            date: dateObj,
            day: this.getDayByTimezone(dateObj, dto.timezone),
            slots: dto.slots,
            timezone: dto.timezone,
          },
        },
        { upsert: true, new: true },
      );

      results.push(availability);
    }

    return results.length === 1 ? results[0] : results;
  }

  /* -------------------- GET BY SCHEDULE -------------------- */

  async getByScheduleId(scheduleId: string) {
    if (!scheduleId)
      throw new BadRequestException('scheduleId is required');

    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    return this.availabilityModel
      .find({ scheduleId: new Types.ObjectId(scheduleId) })
      .sort({ date: 1 })
      .lean();
  }

  /* -------------------- WEEKLY AVAILABILITY -------------------- */

  async getWeeklyAvailability(scheduleId: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    const data = await this.availabilityModel
      .find({ scheduleId: new Types.ObjectId(scheduleId) })
      .sort({ date: 1 })
      .lean();

    return {
      id: Date.now(),
      name: 'Working hours',
      owner_id: scheduleId, // replaced userId
      rules: this.buildWeeklyRules(data),
      rules_version: null,
      timezone: data[0]?.timezone || 'UTC',
    };
  }

  /* -------------------- GET BY MONTH -------------------- */

  async getByMonth(
    month: string,
    scheduleId?: string,
    useGoogleCalendar = false,
    eventId?: string,
  ) {
    if (!scheduleId)
      throw new BadRequestException('scheduleId is required');

    return this.getMonthAvailability(
      month,
      scheduleId,
      useGoogleCalendar,
      eventId,
    );
  }

  private async getMonthAvailability(
    month: string,
    scheduleId: string,
    useGoogleCalendar = false,
    eventId?: string,
  ) {
    const [year, monthNum] = month.split('-').map(Number);

    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM');
    }

    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const filter: any = {
      scheduleId: new Types.ObjectId(scheduleId),
      date: { $gte: startDate, $lte: endDate },
    };

    if (eventId) filter.eventId = new Types.ObjectId(eventId);

    const data = await this.availabilityModel.find(filter).lean();

    let googleBusy: { start: string; end: string }[] = [];
    if (useGoogleCalendar) {
      try {
        googleBusy = await this.googleCalendarService.getBusySlots(
          startDate.toISOString(),
          endDate.toISOString(),
        );
      } catch {}
    }

    const availabilityMap = new Map<string, any>();

    for (const item of data) {
      const dateKey = item.date.toISOString().split('T')[0];

      if (!availabilityMap.has(dateKey)) {
        availabilityMap.set(dateKey, {
          date: dateKey,
          day: item.day,
          timezone: item.timezone,
          slots: [],
        });
      }

      availabilityMap.get(dateKey).slots.push(...item.slots);
    }

    for (const day of availabilityMap.values()) {
      day.slots = day.slots.filter(
        (slot) =>
          !googleBusy.some((busy) => this.isOverlapping(slot, busy)),
      );
    }

    return {
      month,
      timezone: data[0]?.timezone || 'UTC',
      availability: Array.from(availabilityMap.values()),
    };
  }
}
