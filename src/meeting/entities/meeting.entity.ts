
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { IsOptional } from 'class-validator';
// import mongoose, { Document } from 'mongoose';

// export type MeetingDocument = Meeting & Document;

// @Schema({ timestamps: true })
// export class Meeting {

  

//   @Prop()
//   userName: string; // now optional

//   @Prop({ required: true })
//   userEmail: string;

//   @Prop({
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Event',
//     default: null,
//   })
//   eventId?: mongoose.Types.ObjectId;

//   @Prop({ required: true })
//   meetingTitle: string;

//   @Prop({ required: true })
//   duration: number;

//   @Prop()
//   callType: string;

//   @Prop()
//   whoCallsWho: string;

   
//   @Prop()
//   inviteePhoneNumber: string;

//   @Prop({ type: Array })
//   hosts: any[];

//   @Prop({ type: Array })
//   contacts: any[];

//   @Prop({ type: Array })
//   contactQuestions: any[];

//   @Prop({ required: true })
//   startTime: Date;

//   @Prop({ required: true })
//   endTime: Date;

//   @Prop({ unique: true })
//   slug: string;

//   @Prop()
//   meetingUrl: string;
//   @Prop({ default: null })
//   rescheduleReason?: string;

//   // (optional but recommended)
//   @Prop({ default: null })
//   rescheduledAt?: Date;

//   @Prop()
//   selectedDate: string;

//   @Prop()
//   selectedTime: string;

//   @Prop()
//   timezone: string;
// }

// export const MeetingSchema = SchemaFactory.createForClass(Meeting);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ default: 'dashboard' })
bookingSource: string;


  //  ADD THIS (VERY IMPORTANT)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop()
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null,
  })
  eventId?: mongoose.Types.ObjectId;
 
  @Prop({ required: true })
  meetingTitle: string;

  @Prop({ required: true })
  duration: number;

  @Prop()
  callType: string;

  @Prop()
  whoCallsWho: string;

  @Prop()
  inviteePhoneNumber: string;

  @Prop({ type: Array })
  hosts: any[];

  @Prop({ type: Array, default: [] })
  contacts: any[];

  @Prop({ type: Array, default: [] })
  contactQuestions: any[];
  
  @Prop({ type: Object, default: {} })  // ✅ ADD THIS
  callDetails?: {
    hostPhone?: string;
    inviteePhone?: string;
    inviteeEmail?: string;
    additionalInfo?: string;
  };


  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true})
  endTime: Date;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  meetingUrl: string;

  @Prop({ default: null })
  rescheduleReason?: string;

  @Prop({ default: null })
  rescheduledAt?: Date;

  @Prop()
  selectedDate?: string;

  @Prop()
  selectedTime?: string;

  @Prop()
  timezone?: string;

   @Prop({ required: false })
   eventTypeId?:string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
