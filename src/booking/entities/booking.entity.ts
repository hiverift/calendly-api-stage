// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { Document, Types } from 'mongoose';
// export type BookingDocument = Booking & Document;

// @Schema({ timestamps: true })
// export class Booking {


//   userId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User',
//   required: true,
// }



//   @Prop({ required: true })
//   slot: string;

//   @Prop({ required: false })
//   inviteePhone?: string;
//   @Prop({ required: false })
//   eventtitle?: string;

//   @Prop({ required: true })
//   hostId: string;

//   @Prop({ required: true })
//   name: string;

//   @Prop({ required: true })
//   email: string;
//   @Prop()
//   phone?: string;

//   @Prop({required:false})
//   bookingSource?:string;
//  @Prop({ required: false })
//   eventTypeId?:string;
//   @Prop()
//   duration?: number;

//   @Prop({ type: [String], default: [] })
//   guests: string[];

//   @Prop({ required: true })
//   startTime: Date;

//   @Prop({ required: true })
//   endTime: Date;

//   @Prop({ type: Object })
//   answers?: any;
//   @Prop({ default: 'Asia/Kolkata' })
//   timezone?: string;
// }

// export const BookingSchema = SchemaFactory.createForClass(Booking);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  slot: string;

  @Prop()
  inviteePhone?: string;

  @Prop()                    // ✅ NOW CORRECT
  eventtitle?: string;

  @Prop({ required: true })
  hostId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ default: 'public' })
  bookingSource?: string;

  @Prop()
  eventTypeId?: string;

  @Prop()
  duration?: number;

  @Prop({ type: [String], default: [] })
  guests: string[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Object })
  answers?: any;

  @Prop({ default: 'Asia/Kolkata' })
  timezone?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
