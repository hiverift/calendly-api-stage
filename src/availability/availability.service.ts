
// // // // // // import { Injectable, NotFoundException } from '@nestjs/common';
// // // // // // import { InjectModel } from '@nestjs/mongoose';
// // // // // // import { Model, Types } from 'mongoose';
// // // // // // import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

// // // // // // import { EventType, EventTypeDocument, Schedule } from '../event/entities/event.entity';
// // // // // // import { Booking, BookingDocument } from '../booking/entities/booking.entity';
// // // // // // import { CreateScheduleDto, RecurringDayDto, SlotDto, DateOverrideDto } from './dto/create-schedule.dto';

// // // // // // export interface Slot { start: string; end: string; }

// // // // // // @Injectable()
// // // // // // export class AvailabilityService {
// // // // // //   constructor(
// // // // // //     @InjectModel(EventType.name) private eventModel: Model<EventTypeDocument>,
// // // // // //     @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>
// // // // // //   ) { }

// // // // // //   // ---------------- CREATE SCHEDULE ----------------
// // // // // //   async createSchedule(eventTypeId: string, dto: CreateScheduleDto) {
// // // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // // //     const schedule: Schedule = {
// // // // // //       _id: new Types.ObjectId().toHexString(),
// // // // // //       name: dto.name || 'Working hours',
// // // // // //       isActive: false,
// // // // // //       recurring: [],
// // // // // //       dateOverrides: [],
// // // // // //     };

// // // // // //     event.schedules.push(schedule);
// // // // // //     await event.save();
// // // // // //     return {
// // // // // //       statusCode: 200,
// // // // // //       message: 'Schedule created successfully',
// // // // // //       result: schedule,
// // // // // //     };
// // // // // //     }
// // // // // // //     async getSchedules(eventTypeId: string) {
// // // // // // //   const event = await this.eventModel.findById(eventTypeId);
// // // // // // //   if (!event) throw new NotFoundException('Event not found');

// // // // // // //   return {
// // // // // // //     statusCode: 200,
// // // // // // //     result: event.schedules.map(s => ({
// // // // // // //       _id: s._id,
// // // // // // //       name: s.name,
// // // // // // //       isActive: s.isActive,
// // // // // // //     })),
// // // // // // //   };
// // // // // // // }


// // // // // //   // ---------------- ACTIVATE SCHEDULE ----------------
// // // // // //   async setActiveSchedule(eventTypeId: string, scheduleId: string) {
// // // // // //       const event = await this.eventModel.findById(eventTypeId);
// // // // // //       if (!event) throw new NotFoundException('Event not found');

// // // // // //       event.schedules.forEach(s => s.isActive = s._id === scheduleId);
// // // // // //       await event.save();
      
// // // // // //       return {
// // // // // //       statusCode: 200,
// // // // // //       message:'Recurring slots added successfully', scheduleId
      
// // // // // //     };
// // // // // //     }

// // // // // //   // ---------------- ADD RECURRING SLOTS ----------------
// // // // // //  async addRecurringSlots(eventTypeId: string, scheduleId: string, dto: RecurringDayDto[]) {
// // // // // //       const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);

// // // // // //       // Map RecurringDayDto to match schema
// // // // // //       schedule.recurring = dto.map(dayDto => ({
// // // // // //         _id: new Types.ObjectId().toHexString(), // _id for this day
// // // // // //         day: dayDto.day,
// // // // // //         slots: dayDto.slots.map(slot => ({
// // // // // //           start: slot.start,
// // // // // //           end: slot.end,
// // // // // //         })),
// // // // // //       }));

// // // // // //       await event.save();
// // // // // //       return {
// // // // // //         statusCode : 200,
// // // // // //          message: 'Recurring slots added successfully', schedule };
// // // // // //     }

// // // // // //   // ---------------- APPLY TO MULTIPLE DATES ----------------
// // // // // //   async applyToDates(eventTypeId: string, scheduleId: string, dto: { dates: string[], slots?: Slot[], isUnavailable?: boolean }) {
// // // // // //       const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);

// // // // // //       for (const date of dto.dates) {
// // // // // //         schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
// // // // // //         schedule.dateOverrides.push({
// // // // // //           _id: new Types.ObjectId().toHexString(),
// // // // // //           date,
// // // // // //           slots: dto.isUnavailable ? [] : dto.slots || [],
// // // // // //           isUnavailable: !!dto.isUnavailable,
// // // // // //         });
// // // // // //       }

// // // // // //       await event.save();
// // // // // //      return {
// // // // // //         statusCode: 200,
// // // // // //         message: 'Availability applied successfully',
// // // // // //         result: schedule, // optionally return updated schedule
// // // // // //     };
// // // // // //     }

// // // // // //   // ---------------- MONTHLY AVAILABILITY ----------------
// // // // // //   async getMonthlyAvailability(eventTypeId: string, year: number, month: number) {
// // // // // //       const event = await this.eventModel.findById(eventTypeId);
// // // // // //       if (!event) throw new NotFoundException('Event not found');

// // // // // //       const schedule = event.schedules.find(s => s.isActive);
// // // // // //       if (!schedule) return {};

// // // // // //       const result: Record<string, any> = {};
// // // // // //       const daysInMonth = new Date(year, month, 0).getDate();

// // // // // //       for (let day = 1; day <= daysInMonth; day++) {
// // // // // //         const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// // // // // //         const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

// // // // // //         const override = schedule.dateOverrides.find(o => o.date === date);

// // // // // //         if (override) {
// // // // // //           result[date] = override.isUnavailable ? { available: false } : { available: true, ranges: override.slots };
// // // // // //         } else {
// // // // // //           const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday);
// // // // // //           result[date] = recurring ? { available: true, ranges: recurring.slots } : { available: false };
// // // // // //         }
// // // // // //       }

// // // // // //       return {
// // // // // //         statusCode: 200,
// // // // // //         message: 'Monthly availability fetched',
// // // // // //         result,
// // // // // //     };
// // // // // //     }

// // // // // //   // ---------------- DAILY SLOTS ----------------
// // // // // //   async getCalendarSlots(eventTypeId: string, date: string, duration ?: number) {
// // // // // //       const event = await this.eventModel.findById(eventTypeId);
// // // // // //       if (!event) throw new NotFoundException('Event not found');

// // // // // //       const schedule = event.schedules.find(s => s.isActive);
// // // // // //       if (!schedule) return [];

// // // // // //       const override = schedule.dateOverrides.find(o => o.date === date);
// // // // // //       let ranges: Slot[] = [];

// // // // // //       if (override) {
// // // // // //         if (override.isUnavailable) return [];
// // // // // //         ranges = override.slots;
// // // // // //       } else {
// // // // // //         const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
// // // // // //         const recurring = schedule.recurring.find(r => r.day === weekday);
// // // // // //         if (!recurring) return [];
// // // // // //         ranges = recurring.slots;
// // // // // //       }

// // // // // //       const slotDuration = duration || 30;
// // // // // //       let slots = this.generateSlots(ranges, slotDuration);

// // // // // //       const timezone = event.timezone || 'UTC';
// // // // // //       const dayStart = zonedTimeToUtc(`${date}T00:00:00`, timezone);
// // // // // //       const dayEnd = zonedTimeToUtc(`${date}T23:59:59`, timezone);

// // // // // //       const bookings = await this.bookingModel.find({ eventTypeId, startTime: { $gte: dayStart, $lte: dayEnd } });

// // // // // //       slots = slots.filter(slot => !bookings.some(b => {
// // // // // //         const bookedStart = format(utcToZonedTime(b.startTime, timezone), 'HH:mm', { timeZone: timezone });
// // // // // //         return bookedStart === slot.start;
// // // // // //       }));

// // // // // //      return {
// // // // // //         statusCode: 200,
// // // // // //         message: 'Slots fetched successfully',
// // // // // //         result: slots,
// // // // // //     };
// // // // // //     }

// // // // // //   // ---------------- REMOVE OVERRIDE ----------------
// // // // // //   async removeDateOverride(eventTypeId: string, scheduleId: string, overrideId: string) {
// // // // // //       const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);
// // // // // //       schedule.dateOverrides = schedule.dateOverrides.filter(o => o._id !== overrideId);
// // // // // //       await event.save();
// // // // // //       return { message: 'Override removed' };
// // // // // //     }

// // // // // //   // ---------------- HELPERS ----------------
// // // // // //   private async getSchedule(eventTypeId: string, scheduleId: string) {
// // // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // // //     const schedule = event.schedules.find(s => s._id === scheduleId);
// // // // // //     if (!schedule) throw new NotFoundException('Schedule not found');

// // // // // //    return {
// // // // // //         event,schedule // optionally return updated schedule
// // // // // //     };
// // // // // //   }

// // // // // //   private generateSlots(ranges: Slot[], duration: number): Slot[] {
// // // // // //     const slots: Slot[] = [];
// // // // // //     for (const range of ranges) {
// // // // // //       let start = this.toMinutes(range.start);
// // // // // //       const end = this.toMinutes(range.end);

// // // // // //       while (start + duration <= end) {
// // // // // //         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
// // // // // //         start += duration;
// // // // // //       }
// // // // // //     }
// // // // // //     return slots;
// // // // // //   }

// // // // // //   private toMinutes(time: string) {
// // // // // //     const [h, m] = time.split(':').map(Number);
// // // // // //     return h * 60 + m;
// // // // // //   }

// // // // // //   private toTime(minutes: number) {
// // // // // //     const h = Math.floor(minutes / 60);
// // // // // //     const m = minutes % 60;
// // // // // //     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// // // // // //   }
// // // // // // }
// // // // // import { Injectable, NotFoundException } from '@nestjs/common';
// // // // // import { InjectModel } from '@nestjs/mongoose';
// // // // // import { Model, Types } from 'mongoose';
// // // // // import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

// // // // // import { EventType, EventTypeDocument, Schedule } from '../event/entities/event.entity';
// // // // // import { Booking, BookingDocument } from '../booking/entities/booking.entity';
// // // // // import { CreateScheduleDto, RecurringDayDto, SlotDto } from './dto/create-schedule.dto';

// // // // // export interface Slot { start: string; end: string; }

// // // // // @Injectable()
// // // // // export class AvailabilityService {
// // // // //   constructor(
// // // // //     @InjectModel(EventType.name) private eventModel: Model<EventTypeDocument>,
// // // // //     @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>
// // // // //   ) { }

// // // // //   // ---------------- CREATE SCHEDULE ----------------
// // // // //   async createSchedule(eventTypeId: string, dto: CreateScheduleDto) {
// // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // //     // Create schedule with default recurring slots (Mon-Fri 09:00-17:00)
// // // // //     const defaultRecurring: RecurringDayDto[] = [
// // // // //       { day: 'Monday', slots: [{ start: '09:00', end: '17:00' }] },
// // // // //       { day: 'Tuesday', slots: [{ start: '09:00', end: '17:00' }] },
// // // // //       { day: 'Wednesday', slots: [{ start: '09:00', end: '17:00' }] },
// // // // //       { day: 'Thursday', slots: [{ start: '09:00', end: '17:00' }] },
// // // // //       { day: 'Friday', slots: [{ start: '09:00', end: '17:00' }] },
// // // // //     ];

// // // // //     const schedule: Schedule = {
// // // // //       _id: new Types.ObjectId().toHexString(),
// // // // //       name: dto.name || 'Working hours',
// // // // //       isActive: false,
// // // // //       recurring: defaultRecurring.map(day => ({
// // // // //         _id: new Types.ObjectId().toHexString(),
// // // // //         day: day.day,
// // // // //         slots: day.slots.map(slot => ({
// // // // //           start: slot.start,
// // // // //           end: slot.end,
// // // // //         })),
// // // // //       })),
// // // // //       dateOverrides: [],
// // // // //     };

// // // // //     event.schedules.push(schedule);
// // // // //     await event.save();

// // // // //     return {
// // // // //       statusCode: 201,
// // // // //       message: 'Schedule created with default availability',
// // // // //       result: schedule,
// // // // //     };
// // // // //   }

// // // // //   // ---------------- ACTIVATE SCHEDULE ----------------
// // // // //   async setActiveSchedule(eventTypeId: string, scheduleId: string) {
// // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // //     event.schedules.forEach(s => s.isActive = s._id === scheduleId);
// // // // //     await event.save();

// // // // //     return {
// // // // //       statusCode: 200,
// // // // //       message: 'Schedule activated successfully',
// // // // //       scheduleId
// // // // //     };
// // // // //   }

// // // // //   // ---------------- ADD RECURRING SLOTS ----------------
// // // // //   async addRecurringSlots(eventTypeId: string, scheduleId: string, dto: RecurringDayDto[]) {
// // // // //     const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);

// // // // //     schedule.recurring = dto.map(dayDto => ({
// // // // //       _id: new Types.ObjectId().toHexString(),
// // // // //       day: dayDto.day,
// // // // //       slots: dayDto.slots.map(slot => ({
// // // // //         start: slot.start,
// // // // //         end: slot.end,
// // // // //       })),
// // // // //     }));

// // // // //     await event.save();
// // // // //     return {
// // // // //       statusCode: 200,
// // // // //       message: 'Recurring slots added successfully',
// // // // //       schedule
// // // // //     };
// // // // //   }

// // // // //   // ---------------- APPLY TO MULTIPLE DATES ----------------
// // // // //   async applyToDates(eventTypeId: string, scheduleId: string, dto: { dates: string[], slots?: Slot[], isUnavailable?: boolean }) {
// // // // //     const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);

// // // // //     for (const date of dto.dates) {
// // // // //       schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
// // // // //       schedule.dateOverrides.push({
// // // // //         _id: new Types.ObjectId().toHexString(),
// // // // //         date,
// // // // //         slots: dto.isUnavailable ? [] : dto.slots || [],
// // // // //         isUnavailable: !!dto.isUnavailable,
// // // // //       });
// // // // //     }

// // // // //     await event.save();
// // // // //     return {
// // // // //       statusCode: 200,
// // // // //       message: 'Availability applied successfully',
// // // // //       result: schedule,
// // // // //     };
// // // // //   }

// // // // //   // ---------------- MONTHLY AVAILABILITY ----------------
// // // // //   async getMonthlyAvailability(eventTypeId: string, year: number, month: number) {
// // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // //     const schedule = event.schedules.find(s => s.isActive);
// // // // //     if (!schedule) return {};

// // // // //     const result: Record<string, any> = {};
// // // // //     const daysInMonth = new Date(year, month, 0).getDate();

// // // // //     for (let day = 1; day <= daysInMonth; day++) {
// // // // //       const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// // // // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

// // // // //       const override = schedule.dateOverrides.find(o => o.date === date);

// // // // //       if (override) {
// // // // //         result[date] = override.isUnavailable ? { available: false } : { available: true, ranges: override.slots };
// // // // //       } else {
// // // // //         const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday);
// // // // //         result[date] = recurring ? { available: true, ranges: recurring.slots } : { available: false };
// // // // //       }
// // // // //     }

// // // // //     return {
// // // // //       statusCode: 200,
// // // // //       message: 'Monthly availability fetched',
// // // // //       result,
// // // // //     };
// // // // //   }

// // // // //   // ---------------- DAILY SLOTS ----------------
// // // // //   async getCalendarSlots(eventTypeId: string, date: string, duration?: number) {
// // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // //     const schedule = event.schedules.find(s => s.isActive);
// // // // //     if (!schedule) return [];

// // // // //     const override = schedule.dateOverrides.find(o => o.date === date);
// // // // //     let ranges: Slot[] = [];

// // // // //     if (override) {
// // // // //       if (override.isUnavailable) return [];
// // // // //       ranges = override.slots;
// // // // //     } else {
// // // // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
// // // // //       const recurring = schedule.recurring.find(r => r.day === weekday);
// // // // //       if (!recurring) return [];
// // // // //       ranges = recurring.slots;
// // // // //     }

// // // // //     const slotDuration = duration || 30;
// // // // //     let slots = this.generateSlots(ranges, slotDuration);

// // // // //     const timezone = event.timezone || 'UTC';
// // // // //     const dayStart = zonedTimeToUtc(`${date}T00:00:00`, timezone);
// // // // //     const dayEnd = zonedTimeToUtc(`${date}T23:59:59`, timezone);

// // // // //     const bookings = await this.bookingModel.find({ eventTypeId, startTime: { $gte: dayStart, $lte: dayEnd } });

// // // // //     slots = slots.filter(slot => !bookings.some(b => {
// // // // //       const bookedStart = format(utcToZonedTime(b.startTime, timezone), 'HH:mm', { timeZone: timezone });
// // // // //       return bookedStart === slot.start;
// // // // //     }));

// // // // //     return {
// // // // //       statusCode: 200,
// // // // //       message: 'Slots fetched successfully',
// // // // //       result: slots,
// // // // //     };
// // // // //   }

// // // // //   // ---------------- REMOVE OVERRIDE ----------------
// // // // //   async removeDateOverride(eventTypeId: string, scheduleId: string, overrideId: string) {
// // // // //     const { event, schedule } = await this.getSchedule(eventTypeId, scheduleId);
// // // // //     schedule.dateOverrides = schedule.dateOverrides.filter(o => o._id !== overrideId);
// // // // //     await event.save();
// // // // //     return { message: 'Override removed' };
// // // // //   }

// // // // //   // ---------------- HELPERS ----------------
// // // // //   private async getSchedule(eventTypeId: string, scheduleId: string) {
// // // // //     const event = await this.eventModel.findById(eventTypeId);
// // // // //     if (!event) throw new NotFoundException('Event not found');

// // // // //     const schedule = event.schedules.find(s => s._id === scheduleId);
// // // // //     if (!schedule) throw new NotFoundException('Schedule not found');

// // // // //     return { event, schedule };
// // // // //   }

// // // // //   private generateSlots(ranges: Slot[], duration: number): Slot[] {
// // // // //     const slots: Slot[] = [];
// // // // //     for (const range of ranges) {
// // // // //       let start = this.toMinutes(range.start);
// // // // //       const end = this.toMinutes(range.end);

// // // // //       while (start + duration <= end) {
// // // // //         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
// // // // //         start += duration;
// // // // //       }
// // // // //     }
// // // // //     return slots;
// // // // //   }

// // // // //   private toMinutes(time: string) {
// // // // //     const [h, m] = time.split(':').map(Number);
// // // // //     return h * 60 + m;
// // // // //   }

// // // // //   private toTime(minutes: number) {
// // // // //     const h = Math.floor(minutes / 60);
// // // // //     const m = minutes % 60;
// // // // //     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// // // // //   }
// // // // // }
// // // // import { Injectable, NotFoundException } from '@nestjs/common';
// // // // import { InjectModel } from '@nestjs/mongoose';
// // // // import { Model, Types } from 'mongoose';
// // // // import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
// // // // import { Schedule, ScheduleDocument } from '../schedule/entities/schedule.entity';


// // // // export interface Slot { start: string; end: string; }
// // // // export interface RecurringDayDto { day: string; slots: Slot[]; }

// // // // @Injectable()
// // // // export class AvailabilityService {
// // // //   constructor(
// // // //     @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
// // // //   ) {}

// // // //   // ---------------- ADD RECURRING SLOTS ----------------
// // // //   async addRecurringSlots(scheduleId: string, dto: RecurringDayDto[]) {
// // // //     const schedule = await this.getSchedule(scheduleId);

// // // //     schedule.recurring = dto.map(dayDto => ({
// // // //       _id: new Types.ObjectId().toHexString(),
// // // //       day: dayDto.day,
// // // //       slots: dayDto.slots.map(slot => ({ start: slot.start, end: slot.end })),
// // // //     }));

// // // //     await schedule.save();
// // // //     return {
// // // //       statusCode: 200,
// // // //       message: 'Recurring slots added successfully',
// // // //       schedule,
// // // //     };
// // // //   }

// // // //   // ---------------- APPLY TO MULTIPLE DATES ----------------
// // // //   async applyToDates(scheduleId: string, scheduleId: string, dto: { dates: string[]; slots?: Slot[]; isUnavailable?: boolean; }) {
// // // //     const schedule = await this.getSchedule(scheduleId);

// // // //     for (const date of dto.dates) {
// // // //       // Remove existing override for the date
// // // //       schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);

// // // //       // Add new override
// // // //       schedule.dateOverrides.push({
// // // //         _id: new Types.ObjectId().toHexString(),
// // // //         date,
// // // //         slots: dto.isUnavailable ? [] : dto.slots || [],
// // // //         isUnavailable: !!dto.isUnavailable,
// // // //       });
// // // //     }

// // // //     await schedule.save();
// // // //     return {
// // // //       statusCode: 200,
// // // //       message: 'Availability applied successfully',
// // // //       schedule,
// // // //     };
// // // //   }

// // // //   // ---------------- GET MONTHLY AVAILABILITY ----------------
// // // //   async getMonthlyAvailability(scheduleId: string, year: number, month: number) {
// // // //     const schedule = await this.getSchedule(scheduleId);

// // // //     const result: Record<string, any> = {};
// // // //     const daysInMonth = new Date(year, month, 0).getDate();

// // // //     for (let day = 1; day <= daysInMonth; day++) {
// // // //       const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// // // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

// // // //       const override = schedule.dateOverrides.find(o => o.date === date);
// // // //       if (override) {
// // // //         result[date] = override.isUnavailable ? { available: false } : { available: true, ranges: override.slots };
// // // //       } else {
// // // //         const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday);
// // // //         result[date] = recurring ? { available: true, ranges: recurring.slots } : { available: false };
// // // //       }
// // // //     }

// // // //     return {
// // // //       statusCode: 200,
// // // //       message: 'Monthly availability fetched',
// // // //       result,
// // // //     };
// // // //   }

// // // //   // ---------------- GET DAILY SLOTS ----------------
// // // //   async getCalendarSlots(scheduleId: string, date: string, duration: number = 30) {
// // // //     const schedule = await this.getSchedule(scheduleId);

// // // //     let ranges: Slot[] = [];
// // // //     const override = schedule.dateOverrides.find(o => o.date === date);

// // // //     if (override) {
// // // //       if (override.isUnavailable) return [];
// // // //       ranges = override.slots;
// // // //     } else {
// // // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
// // // //       const recurring = schedule.recurring.find(r => r.day === weekday);
// // // //       if (!recurring) return [];
// // // //       ranges = recurring.slots;
// // // //     }

// // // //     const slots = this.generateSlots(ranges, duration);
// // // //     return {
// // // //       statusCode: 200,
// // // //       message: 'Slots fetched successfully',
// // // //       result: slots,
// // // //     };
// // // //   }

// // // //   // ---------------- REMOVE OVERRIDE ----------------
// // // //   async removeDateOverride(scheduleId: string, overrideId: string, overrideId: string) {
// // // //     const schedule = await this.getSchedule(scheduleId);
// // // //     schedule.dateOverrides = schedule.dateOverrides.filter(o => o._id !== overrideId);
// // // //     await schedule.save();
// // // //     return { statusCode: 200, message: 'Override removed' };
// // // //   }

// // // //   // ---------------- HELPERS ----------------
// // // //   private async getSchedule(scheduleId: string) {
// // // //     const schedule = await this.scheduleModel.findById(scheduleId);
// // // //     if (!schedule) throw new NotFoundException('Schedule not found');
// // // //     return schedule;
// // // //   }

// // // //   private generateSlots(ranges: Slot[], duration: number): Slot[] {
// // // //     const slots: Slot[] = [];
// // // //     for (const range of ranges) {
// // // //       let start = this.toMinutes(range.start);
// // // //       const end = this.toMinutes(range.end);

// // // //       while (start + duration <= end) {
// // // //         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
// // // //         start += duration;
// // // //       }
// // // //     }
// // // //     return slots;
// // // //   }

// // // //   private toMinutes(time: string) {
// // // //     const [h, m] = time.split(':').map(Number);
// // // //     return h * 60 + m;
// // // //   }

// // // //   private toTime(minutes: number) {
// // // //     const h = Math.floor(minutes / 60);
// // // //     const m = minutes % 60;
// // // //     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// // // //   }
// // // // }
// // // import { Injectable, NotFoundException } from '@nestjs/common';
// // // import { InjectModel } from '@nestjs/mongoose';
// // // import { Model, Types } from 'mongoose';
// // // import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
// // // import { Schedule, ScheduleDocument } from '../schedule/entities/schedule.entity';
// // // import { EventType, EventTypeDocument } from 'src/event/entities/event.entity';

// // // export interface Slot { start: string; end: string; }
// // // export interface RecurringDayDto { day: string; slots: Slot[]; }

// // // @Injectable()
// // // export class AvailabilityService {
// // //   constructor(
// // //    @InjectModel(EventType.name) private eventModel: Model<EventTypeDocument>

// // //   ) {}

// // //   // ---------------- ADD RECURRING SLOTS ----------------
// // //   async addRecurringSlots(scheduleId: string, dto: RecurringDayDto[]) {
// // //     const schedule = await this.getSchedule(scheduleId);

// // //     schedule.recurring = dto.map(dayDto => ({
// // //       _id: new Types.ObjectId().toHexString(),
// // //       day: dayDto.day,
// // //       slots: dayDto.slots.map(slot => ({ start: slot.start, end: slot.end })),
// // //     }));

// // //     await schedule.save();
// // //     return {
// // //       statusCode: 200,
// // //       message: 'Recurring slots added successfully',
// // //       schedule,
// // //     };
// // //   }

// // //   // ---------------- APPLY TO MULTIPLE DATES ----------------
// // //   async applyToDates(scheduleId: string, dto: { dates: string[]; slots?: Slot[]; isUnavailable?: boolean }) {
// // //     const schedule = await this.getSchedule(scheduleId);

// // //     for (const date of dto.dates) {
// // //       // Remove existing override for the date
// // //       schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);

// // //       // Add new override
// // //       schedule.dateOverrides.push({
// // //         _id: new Types.ObjectId().toHexString(),
// // //         date,
// // //         slots: dto.isUnavailable ? [] : dto.slots || [],
// // //         isUnavailable: !!dto.isUnavailable,
// // //       });
// // //     }

// // //     await schedule.save();
// // //     return {
// // //       statusCode: 200,
// // //       message: 'Availability applied successfully',
// // //       schedule,
// // //     };
// // //   }

// // //   // ---------------- GET MONTHLY AVAILABILITY ----------------
// // //   async getMonthlyAvailability(scheduleId: string, year: number, month: number) {
// // //     const schedule = await this.getSchedule(scheduleId);

// // //     const result: Record<string, any> = {};
// // //     const daysInMonth = new Date(year, month, 0).getDate();

// // //     for (let day = 1; day <= daysInMonth; day++) {
// // //       const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

// // //       const override = schedule.dateOverrides.find(o => o.date === date);
// // //       if (override) {
// // //         result[date] = override.isUnavailable ? { available: false } : { available: true, ranges: override.slots };
// // //       } else {
// // //         const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday);
// // //         result[date] = recurring ? { available: true, ranges: recurring.slots } : { available: false };
// // //       }
// // //     }

// // //     return {
// // //       statusCode: 200,
// // //       message: 'Monthly availability fetched',
// // //       result,
// // //     };
// // //   }

// // //   // ---------------- GET DAILY SLOTS ----------------
// // //   async getCalendarSlots(scheduleId: string, date: string, duration: number = 30) {
// // //     const schedule = await this.getSchedule(scheduleId);

// // //     let ranges: Slot[] = [];
// // //     const override = schedule.dateOverrides.find(o => o.date === date);

// // //     if (override) {
// // //       if (override.isUnavailable) return { statusCode: 200, message: 'No slots available', result: [] };
// // //       ranges = override.slots;
// // //     } else {
// // //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
// // //       const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday.toLowerCase());
// // //       if (!recurring) return { statusCode: 200, message: 'No slots available', result: [] };
// // //       ranges = recurring.slots;
// // //     }

// // //     const slots = this.generateSlots(ranges, duration);
// // //     return {
// // //       statusCode: 200,
// // //       message: 'Slots fetched successfully',
// // //       result: slots,
// // //     };
// // //   }

// // //   // ---------------- REMOVE OVERRIDE ----------------
// // //   async removeDateOverride(scheduleId: string, overrideId: string) {
// // //     const schedule = await this.getSchedule(scheduleId);
// // //     schedule.dateOverrides = schedule.dateOverrides.filter(o => o._id !== overrideId);
// // //     await schedule.save();
// // //     return { statusCode: 200, message: 'Override removed' };
// // //   }

// // //   // ---------------- HELPERS ----------------
// // //   private async getSchedule(scheduleId: string) {
// // //     const schedule = await this.scheduleModel.findById(scheduleId);
// // //     if (!schedule) throw new NotFoundException('Schedule not found');
// // //     return schedule;
// // //   }

// // //   private generateSlots(ranges: Slot[], duration: number): Slot[] {
// // //     const slots: Slot[] = [];
// // //     for (const range of ranges) {
// // //       let start = this.toMinutes(range.start);
// // //       const end = this.toMinutes(range.end);

// // //       while (start + duration <= end) {
// // //         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
// // //         start += duration;
// // //       }
// // //     }
// // //     return slots;
// // //   }

// // //   private toMinutes(time: string) {
// // //     const [h, m] = time.split(':').map(Number);
// // //     return h * 60 + m;
// // //   }

// // //   private toTime(minutes: number) {
// // //     const h = Math.floor(minutes / 60);
// // //     const m = minutes % 60;
// // //     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// // //   }
// // // }
// // import { Injectable, NotFoundException } from '@nestjs/common';
// // import { InjectModel } from '@nestjs/mongoose';
// // import { Model, Types } from 'mongoose';
// // import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
// // import { Schedule, ScheduleDocument } from '../schedule/entities/schedule.entity';


// // export interface Slot { start: string; end: string; }
// // export interface RecurringDayDto { day: string; slots: Slot[]; }

// // @Injectable()
// // export class AvailabilityService {
// //   constructor(
// //     @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
// //   ) {}

// //   // ---------------- CREATE DEFAULT SCHEDULE ----------------
// //   async createDefaultSchedule(dto: { name: string, timezone?: string, maxBookingsPerDay?: number }) {
// //     const schedule = new this.scheduleModel({
// //       name: dto.name,
// //       isActive: true,
// //       timezone: dto.timezone || 'UTC',
// //       maxBookingsPerDay: dto.maxBookingsPerDay || 10,
// //       recurring: [
// //         { _id: new Types.ObjectId().toHexString(), day: 'Monday', slots: [{ start: '09:00', end: '17:00' }] },
// //         { _id: new Types.ObjectId().toHexString(), day: 'Tuesday', slots: [{ start: '09:00', end: '17:00' }] },
// //         { _id: new Types.ObjectId().toHexString(), day: 'Wednesday', slots: [{ start: '09:00', end: '17:00' }] },
// //         { _id: new Types.ObjectId().toHexString(), day: 'Thursday', slots: [{ start: '09:00', end: '17:00' }] },
// //         { _id: new Types.ObjectId().toHexString(), day: 'Friday', slots: [{ start: '09:00', end: '17:00' }] },
// //       ],
// //       dateOverrides: [],
// //     });
// //     await schedule.save();
// //     return schedule;
// //   }

// //   // ---------------- ADD/UPDATE RECURRING SLOTS ----------------
// //   async addRecurringSlots(scheduleId: string, dto: RecurringDayDto[]) {
// //     const schedule = await this.getSchedule(scheduleId);

// //     schedule.recurring = dto.map(dayDto => ({
// //       _id: new Types.ObjectId().toHexString(),
// //       day: dayDto.day,
// //       slots: dayDto.slots.map(slot => ({ start: slot.start, end: slot.end })),
// //     }));

// //     await schedule.save();
// //     return schedule;
// //   }

// //   // ---------------- APPLY AVAILABILITY TO DATES ----------------
// //   async applyToDates(scheduleId: string, dto: { dates: string[], slots?: Slot[], isUnavailable?: boolean }) {
// //     const schedule = await this.getSchedule(scheduleId);

// //     dto.dates.forEach(date => {
// //       schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);

// //       schedule.dateOverrides.push({
// //         _id: new Types.ObjectId().toHexString(),
// //         date,
// //         slots: dto.isUnavailable ? [] : dto.slots || [],
// //         isUnavailable: !!dto.isUnavailable,
// //       });
// //     });

// //     await schedule.save();
// //     return schedule;
// //   }

// //   // ---------------- GET MONTHLY AVAILABILITY ----------------
// //   async getMonthlyAvailability(scheduleId: string, year: number, month: number) {
// //     const schedule = await this.getSchedule(scheduleId);
// //     const result: Record<string, any> = {};
// //     const daysInMonth = new Date(year, month, 0).getDate();

// //     for (let day = 1; day <= daysInMonth; day++) {
// //       const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
// //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

// //       const override = schedule.dateOverrides.find(o => o.date === date);
// //       if (override) {
// //         result[date] = override.isUnavailable ? { available: false } : { available: true, ranges: override.slots };
// //       } else {
// //         const recurring = schedule.recurring.find(r => r.day.toLowerCase() === weekday);
// //         result[date] = recurring ? { available: true, ranges: recurring.slots } : { available: false };
// //       }
// //     }

// //     return result;
// //   }

// //   // ---------------- GET DAILY SLOTS ----------------
// //   async getCalendarSlots(scheduleId: string, date: string, duration: number = 30) {
// //     const schedule = await this.getSchedule(scheduleId);
// //     let ranges: Slot[] = [];

// //     const override = schedule.dateOverrides.find(o => o.date === date);
// //     if (override) {
// //       if (override.isUnavailable) return [];
// //       ranges = override.slots;
// //     } else {
// //       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
// //       const recurring = schedule.recurring.find(r => r.day === weekday);
// //       if (!recurring) return [];
// //       ranges = recurring.slots;
// //     }

// //     return this.generateSlots(ranges, duration);
// //   }

// //   // ---------------- REMOVE DATE OVERRIDE ----------------
// //   async removeDateOverride(scheduleId: string, overrideId: string) {
// //     const schedule = await this.getSchedule(scheduleId);
// //     schedule.dateOverrides = schedule.dateOverrides.filter(o => o._id !== overrideId);
// //     await schedule.save();
// //     return schedule;
// //   }

// //   // ---------------- HELPERS ----------------
// //   private async getSchedule(scheduleId: string) {
// //     const schedule = await this.scheduleModel.findById(scheduleId);
// //     if (!schedule) throw new NotFoundException('Schedule not found');
// //     return schedule;
// //   }

// //   private generateSlots(ranges: Slot[], duration: number) {
// //     const slots: Slot[] = [];
// //     for (const range of ranges) {
// //       let start = this.toMinutes(range.start);
// //       const end = this.toMinutes(range.end);
// //       while (start + duration <= end) {
// //         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
// //         start += duration;
// //       }
// //     }
// //     return slots;
// //   }

// //   private toMinutes(time: string) {
// //     const [h, m] = time.split(':').map(Number);
// //     return h * 60 + m;
// //   }

// //   private toTime(minutes: number) {
// //     const h = Math.floor(minutes / 60);
// //     const m = minutes % 60;
// //     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// //   }
// // }
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { Schedule, ScheduleDocument, Slot, RecurringSlot, DateOverride } from '../schedule/entities/schedule.entity';


// @Injectable()
// export class AvailabilityService {
//   constructor(
//     @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
//   ) {}

//   // Get or create default schedule
//   async getDefaultSchedule(): Promise<ScheduleDocument> {
//     let schedule = await this.scheduleModel.findOne();
//     if (!schedule) {
//       schedule = new this.scheduleModel({
//         name: 'Default Schedule',
//         isActive: true,
//         recurring: [
//           { _id: new Types.ObjectId().toHexString(), day: 'Monday', slots: [{ start: '09:00', end: '17:00' }] },
//           { _id: new Types.ObjectId().toHexString(), day: 'Tuesday', slots: [{ start: '09:00', end: '17:00' }] },
//           { _id: new Types.ObjectId().toHexString(), day: 'Wednesday', slots: [{ start: '09:00', end: '17:00' }] },
//           { _id: new Types.ObjectId().toHexString(), day: 'Thursday', slots: [{ start: '09:00', end: '17:00' }] },
//           { _id: new Types.ObjectId().toHexString(), day: 'Friday', slots: [{ start: '09:00', end: '17:00' }] },
//         ],
//         dateOverrides: [],
//       });
//       await schedule.save();
//     }
//     return schedule;
//   }

//   // Edit recurring slots
//   async updateRecurringSlots(dto: RecurringSlot[]) {
//     const schedule = await this.getDefaultSchedule();
//     schedule.recurring = dto.map(d => ({
//       _id: new Types.ObjectId().toHexString(),
//       day: d.day,
//       slots: d.slots
//     }));
//     await schedule.save();
//     return schedule;
//   }

//   // Apply / edit specific date override
//   async editDateOverride(date: string, slots: Slot[], isUnavailable: boolean = false) {
//     const schedule = await this.getDefaultSchedule();
//     schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
//     schedule.dateOverrides.push({
//       _id: new Types.ObjectId().toHexString(),
//       date,
//       slots: isUnavailable ? [] : slots,
//       isUnavailable
//     });
//     await schedule.save();
//     return schedule;
//   }

//   // Reset date to weekly template
//   async resetDate(date: string) {
//     const schedule = await this.getDefaultSchedule();
//     schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
//     await schedule.save();
//     return schedule;
//   }
//   // Edit availability for multiple dates at once
// async editMultipleDates(dates: string[], slots: Slot[], isUnavailable: boolean = false) {
//   const schedule = await this.getDefaultSchedule();

//   for (const date of dates) {
//     // Remove existing override for this date
//     schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);

//     // Add new override
//     schedule.dateOverrides.push({
//       _id: new Types.ObjectId().toHexString(),
//       date,
//       slots: isUnavailable ? [] : slots,
//       isUnavailable
//     });
//   }

//   await schedule.save();
//   return schedule;
// }


//   // Get calendar slots for a specific date
//   async getCalendarSlots(date: string, duration: number = 30) {
//     const schedule = await this.getDefaultSchedule();

//     const override = schedule.dateOverrides.find(o => o.date === date);
//     let ranges: Slot[] = [];

//     if (override) {
//       if (override.isUnavailable) return [];
//       ranges = override.slots;
//     } else {
//       const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
//       const recurring = schedule.recurring.find(r => r.day === weekday);
//       if (!recurring) return [];
//       ranges = recurring.slots;
//     }

//     return this.generateSlots(ranges, duration);
//   }

//   // Generate slots based on range and duration
//   private generateSlots(ranges: Slot[], duration: number): Slot[] {
//     const slots: Slot[] = [];
//     for (const range of ranges) {
//       let start = this.toMinutes(range.start);
//       const end = this.toMinutes(range.end);

//       while (start + duration <= end) {
//         slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
//         start += duration;
//       }
//     }
//     return slots;
//   }

//   private toMinutes(time: string) {
//     const [h, m] = time.split(':').map(Number);
//     return h * 60 + m;
//   }

//   private toTime(minutes: number) {
//     const h = Math.floor(minutes / 60);
//     const m = minutes % 60;
//     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
//   }
// }
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument, Slot, RecurringSlot, DateOverride } from '../schedule/entities/schedule.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
  ) {}

  // Get or create default schedule
  async getDefaultSchedule(): Promise<ScheduleDocument> {
    let schedule = await this.scheduleModel.findOne();
    if (!schedule) {
      schedule = new this.scheduleModel({
        name: 'Default Schedule',
        isActive: true,
        recurring: [
          { day: 1, slots: [{ start: '09:00', end: '17:00' }] }, // Monday
          { day: 2, slots: [{ start: '09:00', end: '17:00' }] }, // Tuesday
          { day: 3, slots: [{ start: '09:00', end: '17:00' }] }, // Wednesday
          { day: 4, slots: [{ start: '09:00', end: '17:00' }] }, // Thursday
          { day: 5, slots: [{ start: '09:00', end: '17:00' }] }, // Friday
        ],
        dateOverrides: [],
      });
      await schedule.save();
    }
    return schedule;
  }

  // Edit recurring slots
  async updateRecurringSlots(dto: RecurringSlot[]) {
    const schedule = await this.getDefaultSchedule();
    schedule.recurring = dto.map(d => ({
      day: d.day,
      slots: d.slots
    }));
    await schedule.save();
    return schedule;
  }

  // Apply / edit specific date override
  async editDateOverride(date: string, slots: Slot[], isUnavailable: boolean = false) {
    const schedule = await this.getDefaultSchedule();
    schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
    schedule.dateOverrides.push({
      date,
      slots: isUnavailable ? [] : slots,
      isUnavailable
    });
    await schedule.save();
    return schedule;
  }
  async deleteDateOverride(date: string) {
  const schedule = await this.scheduleModel.findOne();

  if (!schedule) {
    throw new NotFoundException('Schedule not found');
  }

  schedule.dateOverrides = schedule.dateOverrides.filter(
    (override) => override.date !== date
  );

  await schedule.save();

  return {
    message: 'Date override deleted successfully',
    date
  };
}


  // Reset date to weekly template
  async resetDate(date: string) {
    const schedule = await this.getDefaultSchedule();
    schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
    await schedule.save();
    return schedule;
  }

  // Edit multiple dates at once
  async editMultipleDates(dates: string[], slots: Slot[], isUnavailable: boolean = false) {
    const schedule = await this.getDefaultSchedule();
    for (const date of dates) {
      schedule.dateOverrides = schedule.dateOverrides.filter(o => o.date !== date);
      schedule.dateOverrides.push({
        date,
        slots: isUnavailable ? [] : slots,
        isUnavailable
      });
    }
    await schedule.save();
    return schedule;
  }

  // Get calendar slots for a specific date
  async getCalendarSlots(date: string, duration: number = 30) {
    const schedule = await this.getDefaultSchedule();

    const override = schedule.dateOverrides.find(o => o.date === date);
    let ranges: Slot[] = [];

    if (override) {
      if (override.isUnavailable) return [];
      ranges = override.slots;
    } else {
      const weekday = new Date(date).getDay(); // 0 = Sunday, 1 = Monday
      const recurring = schedule.recurring.find(r => r.day === weekday);
      if (!recurring) return [];
      ranges = recurring.slots;
    }

    return this.generateSlots(ranges, duration);
  }

  // Generate slots based on range and duration
  private generateSlots(ranges: Slot[], duration: number): Slot[] {
    const slots: Slot[] = [];
    for (const range of ranges) {
      let start = this.toMinutes(range.start);
      const end = this.toMinutes(range.end);

      while (start + duration <= end) {
        slots.push({ start: this.toTime(start), end: this.toTime(start + duration) });
        start += duration;
      }
    }
    return slots;
  }

  private toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toTime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
