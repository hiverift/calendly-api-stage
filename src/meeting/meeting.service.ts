
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';

// IMPORT MONGOOSE ENTITY (NOT DTO)
import { Meeting, MeetingDocument } from './entities/meeting.entity';



@Injectable()
export class MeetingsService {
  // book(dto: CreateMeetingDto, user: any) {
  //   throw new Error('Method not implemented.');
  // }

  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,
  ) {}
   async bookMeeting(user: any, dto: CreateMeetingDto) {
    /** 1️⃣ Parse datetime using USER timezone */
    const bookingDateTime = DateTime.fromFormat(
      `${dto.selectedDate} ${dto.selectedTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: dto.timeZone },
    );

    if (!bookingDateTime.isValid) {
      throw new BadRequestException('Invalid date or time format');
    }

    if (bookingDateTime < DateTime.now().setZone(dto.timeZone)) {
      throw new BadRequestException('Cannot book a meeting in the past');
    }

    /** 2️⃣ Convert to UTC for DB */
    const startTimeUtc = bookingDateTime.toUTC();
    const endTimeUtc = startTimeUtc.plus({ minutes: dto.duration });

    /** 3️⃣ Generate meeting link */
    const slug = uuidv4();
    const meetingUrl = `https://yourapp.com/meet/${slug}`;

    /** 4️⃣ Save everything dynamically */
    const meeting = await this.meetingModel.create({
      userEmail: user.email, // ✅ dynamic from auth
      ...dto,               // ✅ all frontend-controlled
      startTime: startTimeUtc.toJSDate(),
      endTime: endTimeUtc.toJSDate(),
      slug,
      meetingUrl,
    });

    return {
      statusCode: 201,
      message: 'Meeting booked successfully',
      data: meeting,
    };
  }

//   async bookMeeting(user: any, dto: CreateMeetingDto)
//  {

//     const dateTimeString = `${dto.selectedDate} ${dto.selectedTime}`;
//     const bookingDateTime = DateTime.fromFormat(
//   dateTimeString,
//   'yyyy-MM-dd HH:mm'
// );


//     if (!bookingDateTime.isValid) {
//       throw new BadRequestException('Invalid date or time format');
//     }

//     if (bookingDateTime < DateTime.local()) {
//       throw new BadRequestException('Cannot book a meeting in the past');
//     }

//     const slug = uuidv4();
//     const meetingUrl = `https://yourapp.com/meet/${slug}`;

//     const meeting = await this.meetingModel.create({
//       userEmail: user.email,
//       meetingTitle: dto.meetingTitle,
//       duration: dto.duration,
//       callType: dto.callType,
//       whoCallsWho: dto.whoCallsWho,
//       inviteePhoneNumber: dto.inviteePhoneNumber,
//       hosts: dto.hosts,
//       contacts: dto.contacts || [],
//       contactQuestions: dto.contactQuestions || [],
//       startTime: bookingDateTime.toJSDate(),
//       endTime: bookingDateTime.plus({ minutes: dto.duration }).toJSDate(),
//       slug,
//       meetingUrl,
//     });

//     return {
//       statusCode: 201,
//       message: 'Meeting booked successfully',
//       data: meeting,
//     };
//   }

  async getPastMeetings(userEmail: string) {
    return this.meetingModel.find({
      userEmail,
      endTime: { $lt: new Date() },
    });
  }

  async rescheduleMeeting(id: string, dto: RescheduleMeetingDto) {

    const dateTimeString = `${dto.selectedDate} ${dto.selectedTime}`;
    const newTime = DateTime.fromFormat(dateTimeString, 'yyyy-MM-dd hh:mm a');

    if (!newTime.isValid) {
      throw new BadRequestException('Invalid date or time format');
    }

    const meeting = await this.meetingModel.findById(id);
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const duration = dto.duration || meeting.duration;

    meeting.startTime = newTime.toJSDate();
    meeting.endTime = newTime.plus({ minutes: duration }).toJSDate();

    await meeting.save();

    return {
      statusCode: 200,
      message: 'Meeting rescheduled successfully',
      data: meeting,
    };
  }

  async deleteMeeting(id: string) {
    const deleted = await this.meetingModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Meeting not found');
    }

    return {
      statusCode: 200,
      message: 'Meeting deleted successfully',
      data: deleted,
    };
  }

  // Optional – only if controller needs it
  getTimeSlots(date: string, duration: number) {
    const slots: string[] = [];
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:00`);

    while (start <= end) {
      slots.push(start.toISOString());
      start.setMinutes(start.getMinutes() + duration);
    }

    return { date, slots };
  }
}
