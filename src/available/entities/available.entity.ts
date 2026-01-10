
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Availability extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Schedule', required: false })
  scheduleId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  eventId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;




  @Prop({ required: true, enum: ['wday', 'date'] })
  type: 'wday' | 'date';

  // for date override
  @Prop()
  date?: string;

  // for weekly rule
  @Prop()
  wday?: string;

  @Prop({
    type: [
      {
        from: String,
        to: String,
      },
    ],
    default: [],
  })
  intervals: { from: string; to: string }[];

  @Prop({ default: 'Asia/Kolkata' })
  timezone: string;
}

export const AvailabilitySchema =
  SchemaFactory.createForClass(Availability);
