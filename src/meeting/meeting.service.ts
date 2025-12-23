
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { CallType, WhoCallsWho } from './dto/meeting.enums.dto';
import { User, UserDocument } from '../user/entities/user.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>, // dynamic host info
  ) { }

  // -------- BOOK MEETING ------
  async bookMeeting(user: any, dto: CreateMeetingDto) {
    // ------- VALIDATION -------
    if (dto.callType === CallType.PHONE_CALL) {
      if (dto.whoCallsWho === WhoCallsWho.INVITEE_CALLS_HOST) {
        if (!dto.hosts || dto.hosts.length === 0) {
          throw new BadRequestException(
            'At least one host is required for invitee to call host',
          );
        }
      }

      if (dto.whoCallsWho === WhoCallsWho.HOST_CALLS_INVITEE) {
        if (!dto.callDetails?.inviteePhone) {
          throw new BadRequestException(
            'Invitee phone number is required when host calls invitee',
          );
        }
      }
    }

    // ------ DATE & TIME ------
    const bookingDateTime = DateTime.fromFormat(
      `${dto.selectedDate} ${dto.selectedTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: dto.timezone },
    );

    if (!bookingDateTime.isValid) {
      throw new BadRequestException('Invalid date or time');
    }

    if (bookingDateTime < DateTime.now().setZone(dto.timezone)) {
      throw new BadRequestException('Cannot book meeting in the past');
    }

    const startTimeUtc = bookingDateTime.toUTC();
    const endTimeUtc = startTimeUtc.plus({ minutes: dto.duration });

    const conflict = await this.meetingModel.findOne({
      userEmail: user.email,
      startTime: { $lt: endTimeUtc.toJSDate() },
      endTime: { $gt: startTimeUtc.toJSDate() },
    });

    if (conflict) {
      throw new BadRequestException('Time slot already booked');
    }

    // ------- FETCH HOST INFO DYNAMICALLY ----
    const hostEmails = dto.hosts.map(h => h.email);

    const hostsFromDb = await this.userModel.find({ email: { $in: hostEmails } });

    if (!hostsFromDb || hostsFromDb.length === 0) {
      throw new BadRequestException('Selected host(s) not found');
    }

    const formattedHosts = hostsFromDb.map(h => ({
      name: h.name,
      email: h.email,
      // phoneNumber: dto.callDetails?.hostPhone || '',
      timeZone: h.timeZone || dto.timezone,
    }));

    // ------ CREATE MEETING ------
    const slug = uuidv4();
    const meetingUrl = `https://yourapp.com/meet/${slug}`;

    const meeting = await this.meetingModel.create({
      userEmail: user.email,
      userName: user.name,
      meetingTitle: dto.meetingTitle,
      duration: dto.duration,
      callType: dto.callType,
      whoCallsWho: dto.whoCallsWho,
      selectedDate: dto.selectedDate,
      selectedTime: dto.selectedTime,
      timezone: dto.timezone,

      hosts: formattedHosts,
      contacts: dto.contacts || [],
      contactQuestions: dto.contactQuestions || [],
      callDetails: dto.callDetails || {},

      startTime: startTimeUtc.toJSDate(),
      endTime: endTimeUtc.toJSDate(),
      slug,
      meetingUrl,
    });
    return {
      statusCode: 201,
      message: 'Meeting booked successfully',
      data: {
        ...meeting.toObject(),          // original meeting document
        inviteePhone: dto.callDetails?.inviteePhone || null,
        hostPhone: dto.callDetails?.hostPhone || null,
      },
    };
  }

  // ------GET UPCOMING MEETINGS ------
  async getUpcomingMeetings(userEmail: string) {
    return this.meetingModel
      .find({
        userEmail,
        startTime: { $gte: new Date() },
      })
      .sort({ startTime: 1 });
  }

  // --------- GET PAST MEETINGS ----
  async getPastMeetings(userEmail: string) {
    return this.meetingModel.find({
      userEmail,
      endTime: { $lt: new Date() },
    });
  }

  // ------ GET MEETING BY ID ----
  async getMeetingById(id: string, userEmail: string) {
    const meeting = await this.meetingModel.findOne({ _id: id, userEmail });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    return meeting;
  }

  // ----- RESCHEDULE MEETING ----
  async rescheduleMeeting(
    id: string,
    dto: RescheduleMeetingDto,
    userEmail: string,
  ) {
    const meeting = await this.meetingModel.findOne({ _id: id, userEmail });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const newStart = DateTime.fromFormat(
      `${dto.selectedDate} ${dto.selectedTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: meeting.timezone },
    );

    if (!newStart.isValid) {
      throw new BadRequestException('Invalid date or time');
    }

    if (newStart < DateTime.now().setZone(meeting.timezone)) {
      throw new BadRequestException('Cannot reschedule to a past time');
    }

    const newEnd = newStart.plus({ minutes: dto.duration || meeting.duration });

    const conflict = await this.meetingModel.findOne({
      userEmail,
      _id: { $ne: meeting._id },
      startTime: { $lt: newEnd.toJSDate() },
      endTime: { $gt: newStart.toJSDate() },
    });

    if (conflict) {
      throw new BadRequestException('Time slot already booked');
    }

    meeting.startTime = newStart.toUTC().toJSDate();
    meeting.endTime = newEnd.toUTC().toJSDate();
    meeting.selectedDate = dto.selectedDate;
    meeting.selectedTime = dto.selectedTime;
    meeting.duration = dto.duration || meeting.duration;

    await meeting.save();
    return meeting;
  }

  // -------- DELETE MEETING -------
  async deleteMeeting(id: string, userEmail: string) {
    const meeting = await this.meetingModel.findOneAndDelete({ _id: id, userEmail });
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
    return meeting;
  }
//GET TIME SLOTS
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
