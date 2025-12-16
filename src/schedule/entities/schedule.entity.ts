import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Slot {
  @Prop({ required: true })
  start: string; // "09:00"
  @Prop({ required: true })
  end: string;   // "17:00"
}

export const SlotSchema = SchemaFactory.createForClass(Slot);

@Schema()
export class RecurringSlot {
  @Prop({ required: true })
  day: number; // 0 = Sunday, 1 = Monday, etc.
  
  @Prop({ type: [SlotSchema], default: [] })
  slots: Slot[];
}

export const RecurringSlotSchema = SchemaFactory.createForClass(RecurringSlot);

@Schema()
export class DateOverride {
  @Prop({ required: true })
  date: string;

  @Prop({ type: [SlotSchema], default: [] })
  slots: Slot[];

  @Prop({ default: false })
  isUnavailable: boolean;
}

export const DateOverrideSchema = SchemaFactory.createForClass(DateOverride);

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ required: true })
  name: string;  // ✅ use 'name' instead of 'title' to match your service

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [RecurringSlotSchema], default: [] })
  recurring: RecurringSlot[];

  @Prop({ type: [DateOverrideSchema], default: [] })
  dateOverrides: DateOverride[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
