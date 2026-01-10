
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';

// @Schema({ timestamps: true })
// export class Slot extends Document {

//   @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
//   eventId: Types.ObjectId;

//   @Prop({ type: Date, required: true })
//   date: Date;

//   @Prop({ type: String }) 
//   day: string;
//   @Prop({ type: [String], required: true })
//   slots: string[];

//   @Prop({ default: 'Asia/Kolkata' })
//   timezone: string;
// }

// export const SlotSchema = SchemaFactory.createForClass(Slot);

// //  UNIQUE INDEX (eventId + date)
// SlotSchema.index(
//   { eventId: 1, date: 1 },
//   { unique: true }
// );

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Slot extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  eventId?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  date?: Date;

  @Prop({ type: String, required: false })
  day?: string;

  @Prop({ type: [String], required: false, default: [] })
  slots?: string[];

  @Prop({ type: String, required: false, default: 'Asia/Kolkata' })
  timezone?: string;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);

// Optional: Keep unique index only if eventId + date is present
SlotSchema.index(
  { eventId: 1, date: 1 },
  { unique: true, partialFilterExpression: { eventId: { $exists: true }, date: { $exists: true } } }
);
