
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventTypeDocument = EventType & Document;

// interface Slot {
//   start: string;
//   end: string;
// }

// interface RecurringSlot {
//   end: any;
//   start: any;
//   available: any;
//   _id: string;
//   day: string;
//   slots: Slot[];
// }
interface Slot {
  start: string;
  end: string;
}

export interface RecurringSlot {
  _id: string;          // unique id for this day
  day: string;          // Monday, Tuesday, etc.
  slots: Slot[];        // array of slot objects
}


interface DateOverride {
  _id: string;
  date: string; // YYYY-MM-DD
  slots: Slot[];
  isUnavailable: boolean;
}

export interface Schedule {
  _id: string;
  name: string;
  isActive: boolean;
  recurring: RecurringSlot[];
  dateOverrides: DateOverride[];
}

@Schema({ timestamps: true })
export class EventType {
  @Prop({ required: true })
  title: string;

  @Prop()
  type: string; // one-on-one, group, etc.

  @Prop()
  duration: number; // in minutes

  @Prop()
  mode: string; // single, recurring, both

  @Prop({ type: [{ 
    _id: String,
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    recurring: [{ _id: String, day: String, slots: [{ start: String, end: String }] }],
    dateOverrides: [{ _id: String, date: String, slots: [{ start: String, end: String }], isUnavailable: Boolean }]
  }], default: [] })
  schedules: Schedule[];

  // @Prop({ type: [{ day: String, start: String, end: String }] })
  // weeklyAvailability: { day: string; start: string; end: string }[];

  // @Prop({ type: [{ date: Date, start: String, end: String }] })
  // singleDayAvailability: { date: Date; start: string; end: string }[];

  // @Prop({ type: [{ date: Date, slotTaken: Boolean }] })
  // exceptions: { date: Date; slotTaken: boolean }[];

  @Prop({ default: 10 })
  maxBookingsPerDay: number;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop()
  location: string;

  @Prop()
  userId: string;

  @Prop()
  slug: string;

  // Optional root-level active flag
  @Prop({ default: true })
  isActive: boolean;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);

// Auto-generate slug before saving
EventTypeSchema.pre<EventType>('save', function (next) {
  if (!this.slug && this.title) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
});
