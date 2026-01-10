
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DateTime } from 'luxon';

import { Availability } from './entities/available.entity';
import { CreateAvailabilityDto, CreateEventAvailabilityDto } from './dto/create-available.dto';
import { Schedule } from '../schedule/entities/schedule.entity';

type Interval = { from: string; to: string };
const VALID_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];


@Injectable()
export class AvailabilityService {

  constructor(
    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<Availability>,
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
  ) { }

  /* ---------------- HELPERS ---------------- */

  private emptyWeek() {
    return [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ].map(d => ({
      type: 'wday',
      wday: d,
      intervals: [] as Interval[],
    }));
  }

  private getWeekday(date: string, tz: string) {
    return DateTime.fromISO(date, { zone: tz })
      .weekdayLong.toLowerCase();
  }


  /* ---------------- CREATE RULE ---------------- */

  async create(dto: CreateAvailabilityDto) {
    if (dto.scheduleId && !Types.ObjectId.isValid(dto.scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const schedule = await this.scheduleModel.findById(dto.scheduleId);
    if (!schedule) {
      throw new BadRequestException('Schedule not found');
    }

    const timezone = dto.timezone || schedule.timezone || 'Asia/Calcutta';
    const docs: any[] = [];

    /* ---------- WEEKLY ---------- */
    if (dto.weekly?.length) {
      for (const w of dto.weekly) {
        await this.availabilityModel.deleteMany({
          scheduleId: schedule._id,
          userId: new Types.ObjectId(dto.userId),
          type: 'wday',
          wday: w.day,
        });

        docs.push({
          scheduleId: schedule._id,
          userId: new Types.ObjectId(dto.userId),
          type: 'wday',
          wday: w.day,
          intervals: (w.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone,
        });
      }
    }

    /* ---------- DATES ---------- */
    if (dto.dates?.length) {
      for (const d of dto.dates) {
        await this.availabilityModel.deleteMany({
          scheduleId: schedule._id,
          userId: new Types.ObjectId(dto.userId),
          type: 'date',
          date: d.date,
        });

        docs.push({
          scheduleId: schedule._id,
          userId: new Types.ObjectId(dto.userId),
          type: 'date',
          date: d.date,
          intervals: (d.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone,
        });
      }
    }

    if (!docs.length) {
      throw new BadRequestException('No availability provided');
    }

    return this.availabilityModel.insertMany(docs);
  }

  // available.service.ts
  async createForEvents(dto: CreateEventAvailabilityDto) {
    const { userId, eventIds, weekly, dates, timezone, scheduleId } = dto;

    if (!eventIds?.length) {
      throw new BadRequestException('No events provided');
    }

    let finalWeekly = weekly;
    let finalDates = dates;

    /* ===============================
       🔹 FALLBACK TO SCHEDULE
    =============================== */
    if ((!weekly?.length && !dates?.length) && scheduleId) {
      if (!Types.ObjectId.isValid(scheduleId)) {
        throw new BadRequestException('Invalid scheduleId');
      }

      const scheduleRules = await this.availabilityModel.find({
        scheduleId: new Types.ObjectId(scheduleId),
        userId: new Types.ObjectId(userId),
      }).lean();

      if (!scheduleRules.length) {
        throw new BadRequestException('No availability found in schedule');
      }

      finalWeekly = [];
      finalDates = [];

      for (const r of scheduleRules) {
        if (r.type === 'wday'  && r.wday) {
          finalWeekly.push({
            day: r.wday,
            slots: r.intervals.map(i => ({
              start: i.from,
              end: i.to,
            })),
          });
        }

        if (r.type === 'date' && r.date) {
          finalDates.push({
            date: r.date,
            slots: r.intervals.map(i => ({
              start: i.from,
              end: i.to,
            })),
          });                                                        
        }
      }
    }

    if (!finalWeekly?.length && !finalDates?.length) {
      throw new BadRequestException('No availability provided');
    }

    /* ===============================
       🔹 APPLY TO EVENTS
    =============================== */
    const docs: any[] = [];

    for (const eventId of eventIds) {
      if (!Types.ObjectId.isValid(eventId)) {
        throw new BadRequestException(`Invalid eventId: ${eventId}`);
      }

      // delete old event availability
      await this.availabilityModel.deleteMany({
        userId: new Types.ObjectId(userId),
        eventId: new Types.ObjectId(eventId),
      });

      // weekly
      for (const w of finalWeekly || []) {
        docs.push({
          userId: new Types.ObjectId(userId),
          eventId: new Types.ObjectId(eventId),
          type: 'wday',
          wday: w.day,
          intervals: (w.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone: timezone || 'Asia/Calcutta',
        });
      }

      // dates
      for (const d of finalDates || []) {
        docs.push({
          userId: new Types.ObjectId(userId),
          eventId: new Types.ObjectId(eventId),
          type: 'date',
          date: d.date,
          intervals: (d.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone: timezone || 'Asia/Calcutta',
        });
      }
    }

    return this.availabilityModel.insertMany(docs);
  }



 
  private validateSlots(slots: any[]) {
    if (!Array.isArray(slots)) {
      throw new BadRequestException('Slots must be an array');
    }

    for (const s of slots) {
      if (!s.start || !s.end) {
        throw new BadRequestException('Slot start and end are required');
      }

      if (s.start >= s.end) {
        throw new BadRequestException(
          `Invalid slot: start (${s.start}) must be before end (${s.end})`,
        );
      }
    }
  }
  async update(scheduleId: string, userId: string, dto: any) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const userObjectId = new Types.ObjectId(userId);
    const timezone = dto.timezone || 'Asia/Calcutta';

    const docs: any[] = [];
    const deleteFilter: any = {
      userId: userObjectId,
    };

    /* ---------- EVENT MODE ---------- */
    if (dto.eventId) {
      if (!Types.ObjectId.isValid(dto.eventId)) {
        throw new BadRequestException('Invalid eventId');
      }

      deleteFilter.eventId = new Types.ObjectId(dto.eventId);
    }

    /* ---------- SCHEDULE MODE ---------- */
    else {
      if (!Types.ObjectId.isValid(scheduleId)) {
        throw new BadRequestException('Invalid scheduleId');
      }

      const schedule = await this.scheduleModel.findById(scheduleId);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }

      deleteFilter.scheduleId = new Types.ObjectId(scheduleId);
    }

    /* ================= DELETE OLD ================= */
    if (dto.weekly?.length) {
      for (const w of dto.weekly) {
        if (!w.day) throw new BadRequestException('Week day missing');

        const day = w.day.toLowerCase();
        if (!VALID_DAYS.includes(day)) {
          throw new BadRequestException(`Invalid weekday: ${day}`);
        }

        await this.availabilityModel.deleteMany({
          ...deleteFilter,
          type: 'wday',
          wday: day,
        });

        docs.push({
          ...deleteFilter,
          type: 'wday',
          wday: day,
          intervals: (w.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone,
        });
      }
    }

    if (dto.dates?.length) {
      for (const d of dto.dates) {
        if (!d.date || !DateTime.fromISO(d.date).isValid) {
          throw new BadRequestException(`Invalid date: ${d.date}`);
        }

        await this.availabilityModel.deleteMany({
          ...deleteFilter,
          type: 'date',
          date: d.date,
        });

        docs.push({
          ...deleteFilter,
          type: 'date',
          date: d.date,
          intervals: (d.slots ?? []).map(s => ({
            from: s.start,
            to: s.end,
          })),
          timezone,
        });
      }
    }

    if (!docs.length) {
      throw new BadRequestException('No availability provided');
    }

    await this.availabilityModel.insertMany(docs);

    return {
      statusCode: 200,
      message: 'Availability updated successfully',

    };
  }


 

  /* ---------------- DELETE AVAILABILITY ---------------- */
  async deleteBulk(scheduleId: string, userId: string, dto: any) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    if (!dto?.weekly?.length && !dto?.dates?.length) {
      throw new BadRequestException('weekly or dates required');
    }

    const scheduleObjectId = new Types.ObjectId(scheduleId);
    const userObjectId = new Types.ObjectId(userId);

    /* ---------- WEEKLY ---------- */
    if (dto.weekly?.length) {
      for (const w of dto.weekly) {
        if (!w.day) throw new BadRequestException('Week day missing');

        const day = w.day.toLowerCase();
        if (!VALID_DAYS.includes(day)) {
          throw new BadRequestException(`Invalid weekday: ${day}`);
        }

        const doc = await this.availabilityModel.findOne({
          scheduleId: scheduleObjectId,
          userId: userObjectId,
          type: 'wday',
          wday: day,
        });

        if (!doc) {
          throw new NotFoundException(`No availability found for ${day}`);
        }

        // 🔹 Delete entire day
        if (!w.slots?.length) {
          await this.availabilityModel.deleteOne({ _id: doc._id });
          continue;
        }

        // 🔹 Delete specific slots
        this.validateSlots(w.slots);

        for (const slot of w.slots) {
          const exists = doc.intervals.some(
            i => i.from === slot.start && i.to === slot.end,
          );

          if (!exists) {
            throw new NotFoundException(
              `Slot ${slot.start}-${slot.end} not found on ${day}`,
            );
          }

          await this.availabilityModel.updateOne(
            { _id: doc._id },
            {
              $pull: {
                intervals: { from: slot.start, to: slot.end },
              },
            },
          );
        }

        // 🔹 If no intervals left → delete document
        const updated = await this.availabilityModel.findById(doc._id);
        if (!updated?.intervals.length) {
          await this.availabilityModel.deleteOne({ _id: doc._id });
        }
      }
    }

    /* ---------- DATES ---------- */
    if (dto.dates?.length) {
      for (const d of dto.dates) {
        if (!d.date) throw new BadRequestException('Date missing');
        if (!DateTime.fromISO(d.date).isValid) {
          throw new BadRequestException(`Invalid date: ${d.date}`);
        }

        const doc = await this.availabilityModel.findOne({
          scheduleId: scheduleObjectId,
          userId: userObjectId,
          type: 'date',
          date: d.date,
        });

        if (!doc) {
          throw new NotFoundException(`No availability found for ${d.date}`);
        }

        // 🔹 Delete whole date
        if (!d.slots?.length) {
          await this.availabilityModel.deleteOne({ _id: doc._id });
          continue;
        }

        this.validateSlots(d.slots);

        for (const slot of d.slots) {
          const exists = doc.intervals.some(
            i => i.from === slot.start && i.to === slot.end,
          );

          if (!exists) {
            throw new NotFoundException(
              `Slot ${slot.start}-${slot.end} not found on ${d.date}`,
            );
          }

          await this.availabilityModel.updateOne(
            { _id: doc._id },
            {
              $pull: {
                intervals: { from: slot.start, to: slot.end },
              },
            },
          );
        }

        const updated = await this.availabilityModel.findById(doc._id);
        if (!updated?.intervals.length) {
          await this.availabilityModel.deleteOne({ _id: doc._id });
        }
      }
    }

    return {
      deleted: true,
    };
  }

  /* ---------------- GET BY EVENT + USER ---------------- */

  async getByEventAndUser(userId: string, eventId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid eventId');
    }

    const rules = await this.availabilityModel
      .find({
        userId: new Types.ObjectId(userId),
        eventId: new Types.ObjectId(eventId),
      })
      .lean();

    const week = this.emptyWeek();
    const dateRules: { type: 'date'; date: string; intervals: Interval[] }[] = [];

    for (const r of rules) {
      if (r.type === 'wday') {
        const w = week.find(d => d.wday === r.wday);
        if (w) w.intervals = r.intervals;
      }

      if (r.type === 'date' && r.date) {
        dateRules.push({
          type: 'date',
          date: r.date,
          intervals: r.intervals,
        });
      }
    }

    return {
      id: Date.now(),
      owner_id: userId,
      event_id: eventId,
      rules: [...week, ...dateRules],
      timezone: rules[0]?.timezone || 'Asia/Calcutta',
    };
  }



  /* ---------------- GET BY SCHEDULEID ---------------- */

  async getByScheduleId(scheduleId: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    const rules = await this.availabilityModel
      .find({
        scheduleId: new Types.ObjectId(scheduleId)

      })
      .lean();

    const week = this.emptyWeek();
    const dateRules: { type: 'date'; date: string; intervals: Interval[] }[] =
      [];

    for (const r of rules) {
      if (r.type === 'wday') {
        const w = week.find(d => d.wday === r.wday);
        if (w) w.intervals = r.intervals;
      }

      if (r.type === 'date' && r.date) {
        dateRules.push({
          type: 'date',
          date: r.date,
          intervals: r.intervals,
        });
      }
    }

    return {
      id: Date.now(),
      name: 'Working hours',
      owner_id: scheduleId,
      rules: [...week, ...dateRules],
      rules_version: null,
      timezone: rules[0]?.timezone || 'Asia/Calcutta',
    };
  }

  /* ---------------- GET BY SCHEDULEID + USERID ---------------- */

  async getByScheduleIdAndUserId(scheduleId: string, userId: string) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const rules = await this.availabilityModel
      .find({
        scheduleId: new Types.ObjectId(scheduleId),
        userId: new Types.ObjectId(userId),
      })
      .lean();

    const week = this.emptyWeek();
    const dateRules: { type: 'date'; date: string; intervals: Interval[] }[] =
      [];

    for (const r of rules) {
      if (r.type === 'wday') {
        const w = week.find(d => d.wday === r.wday);
        if (w) w.intervals = r.intervals;
      }
      if (r.type === 'date' && r.date) {
        dateRules.push({
          type: 'date',
          date: r.date,
          intervals: r.intervals,
        });
      }
    }

    return {
      id: Date.now(),
      name: 'Working hours',
      owner_id: userId,
      schedule_id: scheduleId,
      rules: [...week, ...dateRules],
      rules_version: null,
      timezone: rules[0]?.timezone || 'Asia/Calcutta',
    };
  }

  /* ---------------- GET AVAILABLE SLOTS ---------------- */

  async getSlots(
    scheduleId: string,
    date: string,
    duration = 15,
    userTimezone = 'Asia/Calcutta',
  ) {
    if (!Types.ObjectId.isValid(scheduleId)) {
      throw new BadRequestException('Invalid scheduleId');
    }

    //  Find DATE rule first
    let rule = await this.availabilityModel.findOne({
      scheduleId: new Types.ObjectId(scheduleId),
      type: 'date',
      date,
    });

    //  If no date rule → fallback to WEEKDAY rule
    if (!rule) {
      // timezone needed only to calculate weekday,
      // use userTimezone temporarily (safe fallback)
      const weekday = this.getWeekday(date, userTimezone);

      rule = await this.availabilityModel.findOne({
        scheduleId: new Types.ObjectId(scheduleId),
        type: 'wday',
        wday: weekday,
      });
    }

    //  No availability
    if (!rule || !rule.intervals?.length) {
      return [];
    }

    //  HOST timezone (Calendly source of truth)
    const hostTimezone = rule.timezone || 'Asia/Calcutta';

    //  Generate slots → HOST ➜ UTC ➜ USER
    return this.splitSlots(
      date,
      rule.intervals,
      duration,
      hostTimezone, // HOST TZ
      userTimezone, // USER TZ
    );
  }


  /* ---------------- SLOT GENERATOR ---------------- */

  private splitSlots(
    date: string,
    intervals: Interval[],
    duration: number,
    hostTz: string,
    userTz: string,
  ) {
    const slots: { start: string; end: string }[] = [];

    for (const i of intervals) {
      let start = DateTime.fromISO(`${date}T${i.from}`, { zone: hostTz });
      const end = DateTime.fromISO(`${date}T${i.to}`, { zone: hostTz });

      while (start.plus({ minutes: duration }) <= end) {
        const utcStart = start.toUTC();
        const utcEnd = start.plus({ minutes: duration }).toUTC();

        slots.push({
          start: utcStart.setZone(userTz).toISO(),
          end: utcEnd.setZone(userTz).toISO(),
        });

        start = start.plus({ minutes: duration });
      }
    }

    return slots;
  }
}
