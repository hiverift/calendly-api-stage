

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Slot } from './entities/slot.entity';
import { getDatesFromOption } from 'src/utils/date-helper';
import { getDayFromDate } from 'src/utils/day-helper';
import { DateTime } from 'luxon';
import { generateSlots } from 'src/utils/slot-generator';
import { Slot, SlotSchema } from 'src/slots/entities/slot.entity';


@Injectable()
export class SlotsService {
  constructor(
    @InjectModel(Slot.name)
    private slotModel: Model<Slot>,
  ) { }

  /* -------------------- HELPERS -------------------- */
  private slotDateToISO(date?: Date): string | undefined {
    if (!date) return undefined;
    return DateTime.fromJSDate(date).toISODate();
  }
  private slotToUTC(date: string, time: string, tz: string) {
    return DateTime
      .fromISO(`${date}T${time}`, { zone: tz })
      .toUTC();
  }

  private isPastSlot(
    date: string,
    time: string,
    hostTimezone: string,
  ) {
    if (!time) return false;
    const slotUtc = this.slotToUTC(date, time, hostTimezone);
    return slotUtc <= DateTime.utc();
  }
  private convertSlotToUserTZ(
    date: Date,
    slot: string,
    hostTz: string,
    userTz: string
  ): string {
    if (!slot) return '';

    let [start, end] = slot.includes(' - ') ? slot.split(' - ').map(s => s.trim()) : [slot, ''];

    if (!start) return '';

    const startDT = DateTime.fromJSDate(date)
      .setZone(hostTz)
      .set(this.parseHourMinute(start))
      .setZone(userTz); // convert to user timezone

    if (end) {
      const endDT = DateTime.fromJSDate(date)
        .setZone(hostTz)
        .set(this.parseHourMinute(end))
        .setZone(userTz);

      return `${startDT.toFormat('hh:mm a')} - ${endDT.toFormat('hh:mm a')}`;
    }

    return startDT.toFormat('hh:mm a');
  }

  // Helper to parse 'hh:mm' or 'hh:mm AM/PM' to {hour, minute}
  private parseHourMinute(time: string) {
    // Try AM/PM first
    let dt = DateTime.fromFormat(time.trim(), 'hh:mm a');
    if (!dt.isValid) {
      // fallback to 24h format
      dt = DateTime.fromFormat(time.trim(), 'HH:mm');
    }
    return { hour: dt.hour, minute: dt.minute };
  }




  /* -------------------- CREATE -------------------- */
  /* -------------------- CREATE -------------------- */
  // async saveSlots(eventId: string, body: any) {
  //   // ✅ CASE 1: controller already generated payload (ARRAY)
  //   if (Array.isArray(body)) {
  //     const results: {
  //       date?: string;
  //       slots?: string[];
  //       timezone?: string;
  //     }[] = [];

  //     for (const item of body) {
  //       const saved = await this.slotModel.findOneAndUpdate(
  //         { eventId: item.eventId, date: item.date },
  //         { $set: item },
  //         { upsert: true, new: true },
  //       );

  //       // ✅ FIX: always convert date using DB timezone (NOT request scope)
  //       results.push({
  //         date: DateTime
  //           .fromJSDate(saved.date!)
  //           .setZone(saved.timezone ?? 'Asia/Kolkata')
  //           .toISODate(),
  //         slots: saved.slots,
  //         timezone: saved.timezone,
  //       });
  //     }

  //     return results;
  //   }

  //   // ✅ CASE 2: original logic (UNCHANGED)
  //   const {
  //     dates,
  //     dateOption,
  //     startTime,
  //     endTime,
  //     duration,

  //     userId,
  //   } = body;

  //   if (!startTime || !endTime || !duration) {
  //     throw new BadRequestException('startTime, endTime & duration required');
  //   }

  //   // let finalDates: string[] = [];
  //   // if (dates?.length) finalDates = dates;
  //   // else if (dateOption) finalDates = getDatesFromOption(dateOption, timezone);
  //   // else throw new BadRequestException('Either dateOption or dates[] is required');
  //   let finalDates: string[];
  //   const timezone = body.timezone || 'Asia/Kolkata';

  //   if (body.dateOption === 'specific_dates') {
  //     // ✅ UI ka requirement: use the dates array
  //     if (!Array.isArray(body.dates) || !body.dates.length) {
  //       throw new BadRequestException('dates[] required for specific_dates');
  //     }
  //     finalDates = body.dates;
  //   }
  //   else if (body.dateOption) {
  //     // predefined options: next_3_days, next_week, etc
  //     finalDates = getDatesFromOption(body.dateOption, timezone);
  //   }
  //   else if (Array.isArray(body.dates)) {
  //     finalDates = body.dates;
  //   }
  //   else if (typeof body.date === 'string') {
  //     finalDates = [body.date];
  //   }
  //   else {
  //     throw new BadRequestException(
  //       'Either dateOption, dates[] or date is required',
  //     );
  //   }


  //   const results: any[] = [];

  //   for (const dateStr of finalDates) {
  //     const slotDateDT = DateTime
  //       .fromISO(dateStr, { zone: timezone })
  //       .startOf('day');

  //     const dailySlots = generateSlots(
  //       [{ start: startTime, end: endTime }],
  //       duration,
  //       dateStr,
  //       timezone,
  //     );

  //     if (!dailySlots.length) continue;

  //     const slotData = {
  //       eventId,
  //       userId: userId ? new Types.ObjectId(userId) : undefined,
  //       date: slotDateDT.toJSDate(), // stored in UTC
  //       slots: dailySlots.map(s => s.label),
  //       timezone,
  //     };

  //     //   const saved = await this.slotModel.findOneAndUpdate(
  //     //     { eventId, date: slotData.date },
  //     //     { $set: slotData },
  //     //     { upsert: true, new: true },
  //     //   );

  //     //   results.push({
  //     //     date: DateTime
  //     //       .fromJSDate(saved.date!)
  //     //       .setZone(saved.timezone ?? timezone)
  //     //       .toISODate(),
  //     //     slots: saved.slots,
  //     //     timezone: saved.timezone,
  //     //   });

  //     // }

  //     // return results;
  //     const saved = await this.slotModel.findOneAndUpdate(
  //       { eventId, date: slotData.date },
  //       { $set: slotData },
  //       { upsert: true, new: true },
  //     );

  //     results.push({
  //       date: DateTime
  //         .fromJSDate(saved.date!)
  //         .setZone(saved.timezone ?? timezone)
  //         .toISODate(),
  //       slots: saved.slots,
  //       timezone: saved.timezone,
  //     });

  //   }
  //   return results;
  // }

  async saveSlots(eventId: string, body: any) {
    const {
      dates,
      dateOption,
      startTime,
      endTime,
      duration,
      timezone = 'Asia/Kolkata',
      userId,
    } = body;

    if (!startTime || !endTime || !duration) {
      throw new BadRequestException('startTime, endTime & duration required');
    }

    // Determine final dates
    let finalDates: string[];
    if (dateOption === 'specific_dates') {
      if (!Array.isArray(dates) || !dates.length) {
        throw new BadRequestException('dates[] required for specific_dates');
      }
      finalDates = dates;
    } else if (dateOption) {
      finalDates = getDatesFromOption(dateOption, timezone);
    } else if (Array.isArray(dates)) {
      finalDates = dates;
    } else if (typeof body.date === 'string') {
      finalDates = [body.date];
    } else {
      throw new BadRequestException(
        'Either dateOption, dates[] or date is required',
      );
    }

    const results: any[] = [];

    for (const dateStr of finalDates) {
      const slotDateDT = DateTime.fromISO(dateStr, { zone: timezone }).startOf('day');

      // Generate all slots for the day
      const dailySlots = generateSlots(
        [{ start: startTime, end: endTime }],
        duration,
        dateStr,
        timezone,
      );

      if (!dailySlots.length) continue;

      const slotData = {
        eventId,
        userId: userId ? new Types.ObjectId(userId) : undefined,
        date: slotDateDT.toJSDate(), // store in UTC
        slots: dailySlots.map(s => s.label),
        timezone,
      };

      const saved = await this.slotModel.findOneAndUpdate(
        { eventId, date: slotData.date },
        { $set: slotData },
        { upsert: true, new: true },
      );

      results.push({
        date: DateTime.fromJSDate(saved.date!).setZone(saved.timezone ?? timezone).toISODate(),
        slots: saved.slots,
        timezone: saved.timezone,
      });
    }

    return results;
  }
  async getSlots(
    eventId: string,
    date?: string,
    dateOption?: string,
    from?: string,
    to?: string,
    userTimezone = 'Asia/Kolkata',
  ) {
    if (!eventId) {
      throw new BadRequestException('eventId required');
    }

    let requestedDates: string[] = [];

    /* ---------------- specific_dates ---------------- */
    if (dateOption === 'specific_dates') {

      // ✅ single date
      if (date) {
        requestedDates = [date];
      }

      // ✅ multiple date range
      else if (from && to) {
        let start = DateTime.fromISO(from, { zone: userTimezone }).startOf('day');
        const end = DateTime.fromISO(to, { zone: userTimezone }).startOf('day');

        while (start <= end) {
          requestedDates.push(start.toISODate()!);
          start = start.plus({ days: 1 });
        }
      }

      else {
        throw new BadRequestException(
          'specific_dates requires date or from/to',
        );
      }
    }

    /* ---------------- predefined options ---------------- */
    else if (dateOption) {
      requestedDates = getDatesFromOption(dateOption, userTimezone);
    }

    /* ---------------- fallback ---------------- */
    else if (date) {
      requestedDates = [date];
    }

    if (!requestedDates.length) {
      throw new BadRequestException('No valid date(s) provided');
    }

    /* ---------------- Mongo date range ---------------- */
    const startDate = DateTime
      .fromISO(requestedDates[0], { zone: userTimezone })
      .startOf('day')
      .toUTC()
      .toJSDate();

    const endDate = DateTime
      .fromISO(requestedDates[requestedDates.length - 1], { zone: userTimezone })
      .endOf('day')
      .toUTC()
      .toJSDate();

    const slots = await this.slotModel.find({
      eventId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    if (!slots.length) {
      throw new BadRequestException(
        'No time slot found for the requested date(s)',
      );
    }

    /* ---------------- response formatting ---------------- */
    return requestedDates.map(d => {
      const slotDoc = slots.find(s =>
        DateTime.fromJSDate(s.date)
          .setZone(userTimezone)
          .toISODate() === d,
      );

      return {
        date: d,
        slots: slotDoc?.slots ?? [],
        timezone: userTimezone,
      };
    });
  }


  // /* -------------------- GET -------------------- */
  // // async getSlots(
  // //   eventId: string,
  // //   date?: string,
  // //   dateOption?: string,
  // //   from?: string,
  // //   to?: string,
  // //   userTimezone = 'Asia/Kolkata',
  // //   userId?: string,
  // // ) {
  // //   if (!eventId) throw new BadRequestException('eventId required');

  // //   const queryBase: any = { eventId };
  // //   if (userId) queryBase.userId = new Types.ObjectId(userId);

  // //   // 1️⃣ Determine requested dates (UNCHANGED)
  // //   // let requestedDates: string[] = [];
  // //   // if (date) requestedDates = [date];
  // //   // else if (dateOption) requestedDates = getDatesFromOption(dateOption, userTimezone);
  // //   // else if (from && to) {
  // //   //   let start = DateTime.fromISO(from).startOf('day');
  // //   //   const end = DateTime.fromISO(to).startOf('day');
  // //   //   while (start <= end) {
  // //   //     requestedDates.push(start.toISODate()!);
  // //   //     start = start.plus({ days: 1 });
  // //   //   }
  // //   // }

  // //   // if (!requestedDates.length) {
  // //   //   throw new BadRequestException('No valid date(s) provided');
  // //   // }
  // //   let requestedDates: string[] = [];

  // //   // ✅ CASE 1: specific dates (calendar selection)
  // //   if (dateOption === 'specific_dates') {
  // //     if (!from && !to && !date) {
  // //       throw new BadRequestException('specific_dates requires date(s)');
  // //     }

  // //     if (date) {
  // //       // single selected date
  // //       requestedDates = [date];
  // //     }
  // //     else if (from && to) {
  // //       // multiple selected dates (calendar range)
  // //       let start = DateTime.fromISO(from, { zone: userTimezone }).startOf('day');
  // //       const end = DateTime.fromISO(to, { zone: userTimezone }).startOf('day');

  // //       while (start <= end) {
  // //         requestedDates.push(start.toISODate()!);
  // //         start = start.plus({ days: 1 });
  // //       }
  // //     }
  // //   }

  // //   // ✅ CASE 2: predefined options
  // //   else if (dateOption) {
  // //     requestedDates = getDatesFromOption(dateOption, userTimezone);
  // //   }

  // //   // ✅ CASE 3: fallback single date
  // //   else if (date) {
  // //     requestedDates = [date];
  // //   }

  // //   if (!requestedDates.length) {
  // //     throw new BadRequestException('No valid date(s) provided');
  // //   }
  // async getSlots(
  //   eventId: string,
  //   date?: string,
  //   dateOption?: string,
  //   from?: string,
  //   to?: string,
  //   timezone = 'Asia/Kolkata',
  // ) {

  //   // 🔹 specific_dates from calendar
  //   if (dateOption === 'specific_dates') {

  //     // Case 1: single date click
  //     if (date) {
  //       return this.slotModel.find({
  //         eventId,
  //         date: {
  //           $gte: DateTime.fromISO(date, { zone: timezone }).startOf('day').toUTC().toJSDate(),
  //           $lte: DateTime.fromISO(date, { zone: timezone }).endOf('day').toUTC().toJSDate(),
  //         },
  //       }).sort({ date: 1 });
  //     }

  //     // Case 2: multiple date select (calendar range)
  //     if (from && to) {
  //       return this.slotModel.find({
  //         eventId,
  //         date: {
  //           $gte: DateTime.fromISO(from, { zone: timezone }).startOf('day').toUTC().toJSDate(),
  //           $lte: DateTime.fromISO(to, { zone: timezone }).endOf('day').toUTC().toJSDate(),
  //         },
  //       }).sort({ date: 1 });
  //     }

  //     throw new BadRequestException('specific_dates requires date or from/to');
  //   }

  //   // 🔹 fallback (next_3_days, next_week, etc)
  // //   return this.handleOtherDateOptions(eventId, dateOption, timezone);
  // // }


  // //  FIX #1: timezone-safe MongoDB date range
  // const startDate = DateTime
  //   .fromISO(requestedDates[0], { zone: userTimezone })
  //   .startOf('day')
  //   .toUTC()
  //   .toJSDate();

  // const endDate = DateTime
  //   .fromISO(requestedDates[requestedDates.length - 1], { zone: userTimezone })
  //   .endOf('day')
  //   .toUTC()
  //   .toJSDate();

  // //  Fetch slots from DB
  // const slots = await this.slotModel
  //   .find({
  //     ...queryBase,
  //     date: {
  //       $gte: startDate,
  //       $lte: endDate,
  //     },
  //   })
  //   .sort({ date: 1 })
  //   .lean();

  // if(!slots.length) {
  //   throw new BadRequestException('No time slot found for the requested date(s)');
  // }

  // const nowUserTZ = DateTime.now().setZone(userTimezone);

  // // 3️⃣ Convert each slot to user timezone and filter past slots
  // const result = requestedDates.map(d => {

  //   //  FIX #2: compare dates in USER timezone
  //   const slotDoc = slots.find(s =>
  //     DateTime.fromJSDate(s.date)
  //       .setZone(userTimezone)
  //       .toISODate() === d
  //   );

  //   if (!slotDoc || !slotDoc.slots?.length) {
  //     return {
  //       date: d,
  //       day: getDayFromDate(new Date(d), userTimezone),
  //       slots: [],
  //     };
  //   }

  //   const convertedSlots = slotDoc.slots
  //     .map((s: string) =>
  //       this.convertSlotToUserTZ(
  //         slotDoc.date!,
  //         s,
  //         slotDoc.timezone ?? 'Asia/Kolkata',
  //         userTimezone,
  //       ),
  //     )
  //     .filter(Boolean)
  //     .filter(s => {
  //       // Only keep slots that are on this requested date
  //       const [startStr] = s.split(' - ');
  //       const slotDT = DateTime.fromJSDate(slotDoc.date!)
  //         .setZone(userTimezone)
  //         .set(this.parseHourMinute(startStr));
  //       return slotDT.toISODate() === d && slotDT > nowUserTZ;
  //     });


  //   return {
  //     date: d,
  //     day: getDayFromDate(new Date(d), userTimezone),
  //     slots: convertedSlots,
  //   };
  // });

  //   return result;
  // }


  /* -------------------- UPDATE -------------------- */
  async updateSlots(eventId: string, body: any) {
    const { date, slots, timezone = 'Asia/Kolkata' } = body;

    if (!eventId || !date || !slots?.length) {
      throw new BadRequestException('eventId, date & slots required');
    }

    const today = DateTime.now().setZone(timezone).toFormat('yyyy-MM-dd');
    if (date < today) {
      throw new BadRequestException('Cannot update past date');
    }

    let validSlots = slots;

    if (date === today) {
      validSlots = slots.filter(
        (slot) => !this.isPastSlot(date, slot.start, timezone),
      );
    }

    if (!validSlots.length) {
      throw new BadRequestException('All slots are in past');
    }

    const slotDate = DateTime.fromISO(date, { zone: timezone }).startOf('day').toJSDate();

    const updated = await this.slotModel.findOneAndUpdate(
      { eventId, date: slotDate },
      {
        $set: {
          slots: validSlots,
          timezone,
          day: getDayFromDate(slotDate, timezone),
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new BadRequestException('Slot not found');
    }

    return {
      date: updated.date!,
      day: getDayFromDate(updated.date!, timezone),
      slots: updated.slots ?? [],
    };
  }

  /* -------------------- DELETE -------------------- */
  async deleteSlots(eventId: string, body: any) {
    const { date, slots } = body;

    if (!eventId || !date) {
      throw new BadRequestException('eventId & date required');
    }

    const slotDate = DateTime.fromISO(date).startOf('day').toJSDate();

    // delete full date
    if (!slots || !slots.length) {
      const deleted = await this.slotModel.findOneAndDelete({
        eventId,
        date: slotDate,
      });

      if (!deleted) {
        throw new BadRequestException('Slot not found');
      }

      return { message: 'Slot date deleted successfully' };
    }

    // delete specific slots
    const updated = await this.slotModel.findOneAndUpdate(
      { eventId, date: slotDate },
      { $pull: { slots: { $in: slots } } },
      { new: true },
    );

    if (!updated) {
      throw new BadRequestException('Slot not found');
    }

    if (!updated.slots || !updated.slots.length) {
      await this.slotModel.deleteOne({ eventId, date: slotDate });
      return { message: 'All slots removed, date deleted' };
    }

    return {
      date: updated.date!,
      slots: updated.slots,
    };
  }
}





