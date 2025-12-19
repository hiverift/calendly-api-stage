
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/* Slot Sub-Schema */
@Schema({ _id: false })
export class Slot {
  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;
}
export const SlotSchema = SchemaFactory.createForClass(Slot);

/* Availability Schema */
@Schema({ timestamps: true })
export class Availability extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Schedule', required: true })
  scheduleId: Types.ObjectId;

@Prop({ type: Types.ObjectId, ref: 'User', required: true })
userId: Types.ObjectId;



  @Prop()
  name: string;

  @Prop({ type: Date,required: true })
  date: Date;

  @Prop({ required: true })
  day: string;

  /* IMPORTANT: use SlotSchema here */
  @Prop({ type: [SlotSchema], default: [] })
  slots: Slot[];

  @Prop({ default: 'UTC' })
  timezone: string;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
