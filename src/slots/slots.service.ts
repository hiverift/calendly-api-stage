

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot } from './entities/slot.entity';
import { getDatesFromOption } from 'src/utils/date-helper';
import { getDayFromDate } from 'src/utils/day-helper';

@Injectable()
export class SlotsService {
  constructor(
    @InjectModel(Slot.name)
    private slotModel: Model<Slot>,
  ) {}

  /* -------------------- HELPERS -------------------- */

  // private isPastSlot(date: string, time: string, timezone: string) {
  //   const now = new Date(
  //     new Date().toLocaleString('en-US', { timeZone: timezone }),
  //   );

  //   const [h, m] = time.split(':').map(Number);
  //   const slotDate = new Date(date);
  //   slotDate.setHours(h, m, 0, 0);

  //   return slotDate <= now;
  // }
  private isPastSlot(date: string, time: string, timezone: string) {
  if (!time) return false; // skip invalid slots

  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone }),
  );

  const [h, m] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(h, m, 0, 0);

  return slotDate <= now;
}


  /* -------------------- CREATE -------------------- */

  async saveSlots(eventId: string, body: any) {
    const { date, dates, slots, timezone = 'Asia/Kolkata', userId } = body;

    if (!eventId || !slots?.length) {
      throw new BadRequestException('eventId & slots required');
    }

    const finalDates: string[] = dates?.length
      ? dates
      : date
      ? [date]
      : [];

    if (!finalDates.length) {
      throw new BadRequestException('Date or dates required');
    }

    const today = new Date().toISOString().split('T')[0];
    const results: Slot[] = [];

    for (const d of finalDates) {
      if (d < today) continue;

      let validSlots = slots;

      if (d === today) {
        validSlots = slots.filter(
          (slot) => !this.isPastSlot(d, slot.start, timezone),
        );
      }

      if (!validSlots.length) continue;

      const saved = await this.slotModel.findOneAndUpdate(
        { eventId, date: new Date(d) },
        {
          $set: {
            eventId,
            userId: userId ? new Types.ObjectId(userId) : undefined,
            date: new Date(d),
            
            slots: validSlots,
            timezone,
            day: getDayFromDate(new Date(d), timezone),
          },
        },
        { upsert: true, new: true },
      );

      results.push(saved);
    }

    if (!results.length) {
      throw new BadRequestException('All selected dates/times are in past');
    }

    return results.map((item) => ({
      date: item.date,
      day: getDayFromDate(item.date, item.timezone),
      slots: item.slots,
    }));
  }

  /* -------------------- GET -------------------- */

  async getSlots(
    eventId: string,
    date?: string,
    dateOption?: string,
    from?: string,
    to?: string,
    timezone = 'Asia/Kolkata',
    userId?: string,
  ) {
    if (!eventId) {
      throw new BadRequestException('eventId required');
    }

    const query: any = { eventId };

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    if (date) {
      query.date = new Date(date);
    } else if (dateOption) {
      query.date = {
        $in: getDatesFromOption(dateOption, timezone).map(
          (d) => new Date(d),
        ),
      };
    } else if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const slots = await this.slotModel
      .find(query)
      .sort({ date: 1 })
      .lean();

    return slots.map((item) => ({
      date: item.date,
      day: getDayFromDate(item.date, timezone),
      slots: item.slots,
    }));
  }

  /* -------------------- UPDATE -------------------- */

  async updateSlots(eventId: string, body: any) {
    const { date, slots, timezone = 'Asia/Kolkata' } = body;

    if (!eventId || !date || !slots?.length) {
      throw new BadRequestException('eventId, date & slots required');
    }

    const today = new Date().toISOString().split('T')[0];
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

    const slotDate = new Date(date);

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
      date: updated.date,
      day: getDayFromDate(updated.date, timezone),
      slots: updated.slots,
    };
  }

  /* -------------------- DELETE -------------------- */

  async deleteSlots(eventId: string, body: any) {
    const { date, slots } = body;

    if (!eventId || !date) {
      throw new BadRequestException('eventId & date required');
    }

    const slotDate = new Date(date);

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

    if (!updated.slots.length) {
      await this.slotModel.deleteOne({ eventId, date: slotDate });
      return { message: 'All slots removed, date deleted' };
    }

    return {
      date: updated.date,
      slots: updated.slots,
    };
  }
}

