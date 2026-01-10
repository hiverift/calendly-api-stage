
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  Matches,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CallType, WhoCallsWho } from './meeting.enums.dto';
import { ContactDto, HostDto, QuestionAnswerDto } from './meeting-nested.dto';
import { CallDetailsDto } from './call-details.dto';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  meetingTitle: string;

  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsEnum(CallType)
  callType: CallType;

  @IsEnum(WhoCallsWho)
  whoCallsWho: WhoCallsWho;

  /** Invitee / Host call details (dynamic) */
  @IsOptional()
  @ValidateNested()
  @Type(() => CallDetailsDto)
  // callDetails?: CallDetailsDto;
  callDetails?: CallDetailsDto | null;

  /** Timezone */
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HostDto)
  hosts: HostDto[];

  @IsString()
  @IsNotEmpty()
  selectedDate: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  selectedTime: string;

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
  @IsOptional()
  @IsEnum(['dashboard'])  
  bookingSource?: 'dashboard' ;
}


