import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { Booking } from './entities/booking.entity';
import { Meeting } from 'src/meeting/entities/meeting.entity';
import { User } from 'src/user/entities/user.entity';
import { EventType } from 'src/event/entities/event.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Meeting.name) private meetingModel: Model<Meeting>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EventType.name) private eventTypeModel: Model<EventType>,
  ) {}

  // ✅ sirf DATE rakhega (time hata dega)
  private stripTime(dateString: string): Date {
    const d = new Date(dateString);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Google Token Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to generate Google access token');
    }
  }

  private async sendMeetingEmail(to: string, meeting: any) {
    if (!to) return;
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"YourApp" <${process.env.SMTP_USER}>`,
        to,
        subject: `Meeting Scheduled: ${meeting.meetingTitle}`,
        html: `
          <p>Hello,</p>
          <p>Your meeting <b>${meeting.meetingTitle}</b> is confirmed.</p>
          <p><b>Date:</b> ${DateTime.fromJSDate(meeting.startTime)
            .setZone(meeting.timezone)
            .toFormat('yyyy-MM-dd')}</p>
        `,
      });
    } catch (err) {
      console.error('Failed to send email to', to, err.message);
    }
  }

  async book(dto: any) {
    const {
      eventTypeId,
      eventtitle,
      name,
      email,
      slot,
      startTime,
      endTime,
      hostId,
      answers,
      guests = [],
    } = dto;

    // ✅ DATE ONLY
    const startDateOnly = this.stripTime(startTime);
    const endDateOnly = this.stripTime(endTime);

    const hostUser = await this.userModel.findById(hostId);
    if (!hostUser) throw new BadRequestException('Host not found');

    // ✅ FIXED CONFLICT CHECK
    // same host + same date + same slot ❌
    // same date + different slot ✅
    const conflictingBooking = await this.bookingModel.findOne({
      hostId: hostUser._id,
      startTime: startDateOnly,
      slot: slot,
    });

    if (conflictingBooking) {
      throw new BadRequestException('This time slot is already booked for the host');
    }

    // ✅ BOOKING CREATE
    const booking = await this.bookingModel.create({
      userId: hostUser._id,
      eventtitle,
      eventTypeId,
      hostId,
      name,
      email,
      slot,
      startTime: startDateOnly,
      endTime: endDateOnly,
      answers,
      guests,
      bookingSource: 'public',
      timezone: 'Asia/Kolkata',
    });

    // ✅ MEETING CREATE
    const meeting = await this.meetingModel.create({
      bookingSource: 'public',
      eventId: eventTypeId,
      meetingTitle: eventtitle || 'Meeting',

      userId: hostUser._id,
      userEmail: hostUser.email,
      userName: hostUser.name,
      startTime: startDateOnly,
      endTime: endDateOnly,
      timezone: 'Asia/Kolkata',
      hosts: [
        {
          userId: hostUser._id,
          name: hostUser.name,
          email: hostUser.email,
          timeZone: 'Asia/Kolkata',
        },
      ],
      contacts: guests.map((g) => ({ email: g })),
      callDetails: { inviteeEmail: email },
      duration: dto.duration || 30,
      slug: uuidv4(),
      meetingUrl: `https://yourapp.com/meet/${uuidv4()}`,
    });

    // GOOGLE CALENDAR (unchanged)
    try {
      const accessToken = await this.getAccessToken();
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: meeting.meetingTitle,
          description: 'Meeting scheduled via YourApp',
          start: { dateTime: meeting.startTime.toISOString(), timeZone: meeting.timezone },
          end: { dateTime: meeting.endTime.toISOString(), timeZone: meeting.timezone },
          attendees: [
            ...guests.map((g) => ({ email: g })),
            { email: hostUser.email },
          ],
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          params: { conferenceDataVersion: 1, sendUpdates: 'all' },
        },
      );
    } catch (err) {
      console.error('Google Calendar Error:', err.response?.data || err.message);
    }

    return {
      statusCode: 201,
      message: 'Booking successful',
      result: {
        _id: booking._id,
        eventTitle: booking.eventtitle,
        slot: booking.slot,
        hostId: booking.hostId,
        name: booking.name,
        email: booking.email,
        bookingSource: 'public',
        eventTypeId: booking.eventTypeId,
        guests: booking.guests,
        startTime: booking.startTime,
        endTime: booking.endTime,
        answers: booking.answers,
        timezone: booking.timezone,
        __v: booking.__v,
      },
    };
  }
}
