
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class HostDto {
  @IsOptional()
  @IsString()
  id?: string; // Optional for dynamic host lookup

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  email?: string;
  
  @IsOptional()
  @IsString()
  phoneNumber?: string; // Optional, invitee can provide email
}
export class ContactDto {
   @IsOptional()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class QuestionAnswerDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
