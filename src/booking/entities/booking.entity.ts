


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
 
  @Prop({ type: Types.ObjectId, ref: 'EventType', required: true })
  eventTypeId: Types.ObjectId;  // Reference to EventType

  @Prop({ required: true })
  userId: string;               

  @Prop({ required: true })
  slot: string;                 

  @Prop({ required: false })
  inviteePhone?: string;    

  @Prop({ required: true })
  hostId: string;               

  @Prop({ required: true })
  name: string;                 

  @Prop({ required: true })
  email: string;           

  @Prop({ required: true })
  startTime: Date;              

  @Prop({ required: true })
  endTime: Date;                

  @Prop({ type: Object })
  answers?: any;                
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
