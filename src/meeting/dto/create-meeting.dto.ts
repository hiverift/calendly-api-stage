
// // import {
// //   IsString,
// //   IsArray,
// //   IsOptional,
// //   IsEnum,
// //   IsNotEmpty,
// //   IsEmail,
// //   IsNumber,
// //   ValidateNested,
// //   Min
// // } from 'class-validator';
// // import { Type } from 'class-transformer';

// // export enum CallType {
// //   PHONE_CALL = 'phone_call',
// //   GOOGLE_MEET = 'google_meet',
// //   ZOOM = 'zoom',
// //   IN_PERSON = 'in_person',
// // }

// // export enum WhoCallsWho {
// //   HOST_CALLS_INVITEE = 'host_calls_invitee',
// //   INVITEE_CALLS_HOST = 'invitee_calls_host',
// // }

// // class HostDto {
// //   @IsString()
// //   @IsNotEmpty()
// //   id: string;

// //   @IsString()
// //   @IsNotEmpty()
// //   name: string;

// //   @IsString()
// //   @IsNotEmpty()
// //   timeZone: string;
// // }

// // class ContactDto {
// //   @IsString()
// //   @IsNotEmpty()
// //   id: string;

// //   @IsString()
// //   @IsNotEmpty()
// //   name: string;

// //   @IsEmail()
// //   email: string;

// //   @IsString()
// //   @IsOptional()
// //   phone?: string;
// // }

// // class QuestionAnswerDto {
// //   @IsString()
// //   @IsNotEmpty()
// //   question: string;

// //   @IsString()
// //   @IsNotEmpty()
// //   answer: string;
// // }

// // // export class CreateMeetingDto {

// // //   @IsEmail()
// // //   @IsNotEmpty()
// // //   userEmail: string;

// // //   @IsString()
// // //   @IsNotEmpty()
// // //   meetingTitle: string;

// // //   @IsNumber()
// // //   @Min(1)
// // //   duration: number;

// // //   @IsEnum(CallType)
// // //   callType: CallType;

// // //   @IsEnum(WhoCallsWho)
// // //   whoCallsWho: WhoCallsWho;

// // //   @IsString()
// // //   @IsNotEmpty()
// // //   inviteePhoneNumber: string;

// // //   @IsArray()
// // //   @ValidateNested({ each: true })
// // //   @Type(() => HostDto)
// // //   hosts: HostDto[];

// // //   @IsArray()
// // //   @IsOptional()
// // //   @ValidateNested({ each: true })
// // //   @Type(() => ContactDto)
// // //   contacts?: ContactDto[];

// // //   @IsArray()
// // //   @IsOptional()
// // //   @ValidateNested({ each: true })
// // //   @Type(() => QuestionAnswerDto)
// // //   contactQuestions?: QuestionAnswerDto[];

// // //   @IsString()
// // //   @IsNotEmpty()
// // //   selectedDate: string;

// // //   @IsString()
// // //   @IsNotEmpty()
// // //   selectedTime: string;
// // // }
// // export class CreateMeetingDto {

// //   @IsString()
// //   @IsNotEmpty()
// //   meetingTitle: string;

// //   @IsNumber()
// //   @Min(1)
// //   duration: number;

// //   @IsEnum(CallType)
// //   callType: CallType;

// //   @IsEnum(WhoCallsWho)
// //   whoCallsWho: WhoCallsWho;

// //   @IsString()
// //   @IsNotEmpty()
// //   inviteePhoneNumber: string;

// //   @IsArray()
// //   @ValidateNested({ each: true })
// //   @Type(() => HostDto)
// //   hosts: HostDto[];

// //   @IsArray()
// //   @IsOptional()
// //   @ValidateNested({ each: true })
// //   @Type(() => ContactDto)
// //   contacts?: ContactDto[];

// //   @IsArray()
// //   @IsOptional()
// //   @ValidateNested({ each: true })
// //   @Type(() => QuestionAnswerDto)
// //   contactQuestions?: QuestionAnswerDto[];

// //   @IsString()
// //   @IsNotEmpty()
// //   selectedDate: string;

// //   @IsString()
// //   @IsNotEmpty()
// //   selectedTime: string;
// // }

// export class CreateMeetingDto {
//   @IsString()
//   @IsNotEmpty()
//   meetingTitle: string;

//   @IsNumber()
//   @Min(1)
//   duration: number;

//   @IsEnum(CallType)
//   callType: CallType;

//   @IsEnum(WhoCallsWho)
//   whoCallsWho: WhoCallsWho;

//   @IsString()
//   @IsNotEmpty()
//   inviteePhoneNumber: string;

//   @IsString()
//   @IsNotEmpty()
//   timeZone: string; // "America/New_York"

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => HostDto)
//   hosts: HostDto[];

//   @IsArray()
//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => ContactDto)
//   contacts?: ContactDto[];

//   @IsArray()
//   @IsOptional()
//   @ValidateNested({ each: true })
//   @Type(() => QuestionAnswerDto)
//   contactQuestions?: QuestionAnswerDto[];

//   @IsString()
//   @IsNotEmpty()
//   selectedDate: string; // "2025-12-10"

//   @IsString()
//   @IsNotEmpty()
//   selectedTime: string; // "10:30 AM"
// }
// src/meeting/dto/create-meeting.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CallType, WhoCallsWho } from './meeting.enums.dto';
import {
  HostDto,
  ContactDto,
  QuestionAnswerDto,
} from './meeting-nested.dto';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  meetingTitle: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsEnum(CallType)
  callType: CallType;

  @IsEnum(WhoCallsWho)
  whoCallsWho: WhoCallsWho;

  @IsString()
  @IsNotEmpty()
  inviteePhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HostDto)
  hosts: HostDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts?: ContactDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  contactQuestions?: QuestionAnswerDto[];

  @IsString()
  @IsNotEmpty()
  selectedDate: string;

  @IsString()
  @IsNotEmpty()
  selectedTime: string;
}
