
import { CallType, WhoCallsWho } from './meeting.enums.dto';
import {
  HostDto,
  ContactDto,
  QuestionAnswerDto,
} from './meeting-nested.dto';

export class Meeting {
  id: string;

  meetingTitle: string;
  duration: number;

  callType: CallType;
  whoCallsWho: WhoCallsWho;

  inviteePhoneNumber: string;
  timeZone: string;

  hosts: HostDto[];
  contacts?: ContactDto[];
  contactQuestions?: QuestionAnswerDto[];

  startTime: Date;
  endTime: Date;

  createdAt: Date;
}
