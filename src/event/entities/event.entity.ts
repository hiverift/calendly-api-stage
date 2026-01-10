
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventTypeDocument = EventType & Document;


interface Slot {
  start: string;
  end: string;
}

export interface RecurringSlot {
  _id: string;          
  day: string;          
  slots: Slot[];        
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
  @Prop({ type: String, default: () => new Types.ObjectId().toHexString() })
  _id: string;  

  @Prop({ required: true })
  title: string;

  @Prop()
  type: string;

  @Prop()
  duration: number;

  @Prop()
  mode: string;

  @Prop({ type: [{
    _id: String,
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    recurring: [{ _id: String, day: String, slots: [{ start: String, end: String }] }],
    dateOverrides: [{ _id: String, date: String, slots: [{ start: String, end: String }], isUnavailable: Boolean }]
  }], default: [] })
  schedules: Schedule[];

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
