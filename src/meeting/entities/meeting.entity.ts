import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema({ timestamps: true })
export class Meeting {

  @Prop({ required: true })
  userEmail: string;

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

  @Prop({ type: Array })
  contacts: any[];

  @Prop({ type: Array })
  contactQuestions: any[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  meetingUrl: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
