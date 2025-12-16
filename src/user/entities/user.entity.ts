import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // adds createdAt & updatedAt fields
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, default: null })
  password: string;

  @Prop({ default: null })
  otp: string;

  @Prop({ default: null })
  otpExpires: Date;

  @Prop({ type: String, default: 'user' })
  role: string;

  @Prop({ required: false })
  provider?: string;

  @Prop({ required: false, default: null })
  googleId?: string;

  @Prop({ required: false, default: null })
  avatar?: string;

  @Prop({  required: false })
  welcomeMessage: string;


  @Prop({ type: String, default: 'English' })
  language: string;
  @Prop({ type: String, default: 'DD/MM/YYYY' })
  dateFormat: string;
  @Prop({ type: String, default: '12h (am/pm)' })
  timeFormat: string;
  @Prop({ type: String, default: 'India' })
  country: string;
  @Prop({ type: String, default: 'Eastern Time - US & Canada' })
  timeZone: string;
  @Prop({ type: String, required: false })
  profileImage: string; // store URL or file path

}



export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
});
