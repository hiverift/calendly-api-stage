import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Slot {
  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;
}

@Schema()
export class RecurringAvailability {
  @Prop({ required: true })
  day: number;

  @Prop({ type: [Slot], default: [] })
  slots: Slot[];
}

@Schema()
export class DateOverride {
  @Prop({ required: true })
  date: string;

  @Prop({ type: [Slot], default: [] })
  slots: Slot[];

  @Prop({ default: false })
  isUnavailable: boolean;
}

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ required: true })
  name: string;
  // @Prop({ required: true, type: String })
  // userId: string;
  @Prop({ type: String, default: null })
  userId?: string;


  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [RecurringAvailability], default: [] })
  recurring: RecurringAvailability[];

  @Prop({ type: [DateOverride], default: [] })
  dateOverrides: DateOverride[];


  // ✅ Add this
  @Prop({ default: false })
  isDefault: boolean;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
ScheduleSchema.index(
  { name: 1, userId: 1 },
  { unique: true }
);

