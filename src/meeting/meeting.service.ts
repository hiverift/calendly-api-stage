// meetings.service.ts
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { CallType, WhoCallsWho } from './dto/meeting.enums.dto';
import { User, UserDocument } from '../user/entities/user.entity';
import { Booking, BookingDocument } from '../booking/entities/booking.entity';
import { Slot, SlotSchema } from '../slots/entities/slot.entity';
import nodemailer from 'nodemailer';
// import { GoogleService } from 'src/google-calendar/google.service';
import axios from 'axios';
// import { log } from 'console';
// import { response } from 'express';



interface UpcomingMeeting {
  id: any;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  timezone?: string;
  hosts: any[];
  contacts: any[];
  bookingSource: string;
  eventTypeId?: string; // ✅ add this
}

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,
    @InjectModel(Booking.name)
    private readonly eventBookingModel: Model<BookingDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Slot.name)
    private readonly slotModel: Model<Document>,

  ) { }

  private async sendMeetingEmail(to: string, meeting: MeetingDocument) {
    if (!to) return; // skip if no email

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true if 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"YourApp" <${process.env.SMTP_USER}>`,
      to,
      subject: `Meeting Scheduled: ${meeting.meetingTitle}`,
      html: `
      <p>Hello,</p>
      <p>Your meeting "<b>${meeting.meetingTitle}</b>" is scheduled.</p>
      <p>Time: ${meeting.selectedDate} ${meeting.selectedTime} (${meeting.timezone})</p>
      <p>Duration: ${meeting.duration} minutes</p>
      <p>Meeting URL: <a href="${meeting.meetingUrl}">${meeting.meetingUrl}</a></p>
      <p>Thank you!</p>
    `,
    };

    await transporter.sendMail(mailOptions);
  }

  private toUTC(date: string, time: string, tz: string): Date {
    return DateTime
      .fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: tz })
      .toUTC()
      .toJSDate();
  }
  async bookMeeting(user: any, dto: CreateMeetingDto) {
    const bookingUserEmail = user?.email || dto.hosts?.[0]?.email;
    if (!bookingUserEmail)
      throw new BadRequestException('Booking owner not found');

    const bookingUser = await this.userModel.findOne({
      email: bookingUserEmail,
    });
    if (!bookingUser)
      throw new BadRequestException('Booking user not found');

    const bookingDateTime = DateTime.fromFormat(
      `${dto.selectedDate} ${dto.selectedTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: dto.timezone },
    );

    if (!bookingDateTime.isValid)
      throw new BadRequestException('Invalid date or time');

    const startTimeUtc = bookingDateTime.toUTC();
    const endTimeUtc = startTimeUtc.plus({ minutes: dto.duration });

    const formattedHosts = await this.userModel.find({
      email: { $in: dto.hosts.map(h => h.email) },
    });

    const inviteeEmail =
      dto.contacts && dto.contacts.length > 0
        ? dto.contacts[0].email
        : null;

    const meeting = await this.meetingModel.create({
      userId: bookingUser._id,
      userEmail: bookingUserEmail,
      userName: user?.name || 'Guest Booking',
      meetingTitle: dto.meetingTitle,
      duration: dto.duration,
      whoCallsWho: dto.whoCallsWho || WhoCallsWho.HOST_CALLS_INVITEE,
      selectedDate: dto.selectedDate,
      selectedTime: dto.selectedTime,
      timezone: dto.timezone,
      hosts: formattedHosts.map(h => ({
        name: h.name,
        email: h.email,
        timeZone: h.timeZone || dto.timezone,
      })),
      contacts: dto.contacts || [],
      startTime: startTimeUtc.toJSDate(),
      endTime: endTimeUtc.toJSDate(),
      slug: uuidv4(),
      meetingUrl: `https://yourapp.com/meet/${uuidv4()}`,
      bookingSource: dto.bookingSource ?? 'dashboard',
    });

    // ================= GOOGLE CALENDAR =================
    const attendees: { email: string }[] = [];


    if (inviteeEmail) attendees.push({ email: inviteeEmail });
    for (const host of formattedHosts) {
      attendees.push({ email: host.email });
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          summary: meeting.meetingTitle,
          description: 'Meeting scheduled via YourApp',
          start: {
            dateTime: meeting.startTime.toISOString(),
            timeZone: meeting.timezone,
          },
          end: {
            dateTime: meeting.endTime.toISOString(),
            timeZone: meeting.timezone,
          },
          attendees,
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            conferenceDataVersion: 1,
            sendUpdates: 'all',
          },
        },
      );

      console.log('Google Meet link:', response.data.hangoutLink);
    } catch (err) {
      console.error(
        'Google Calendar Error:',
        err.response?.data || err.message,
      );
    }

    return {
      statusCode: 201,
      message: 'Meeting booked successfully',
      data: meeting,
    };
  }

  // -------- BOOK MEETING ------


  async syncEventBookingToMeeting(dto: any) {
    const timezone = dto.timezone || 'Asia/Kolkata';

    // Helper to parse either ISO string or slot time
    function parseToUTC(date: string, timeOrISO: string) {
      let dt: DateTime;

      if (timeOrISO.includes('T')) {
        // ISO string
        dt = DateTime.fromISO(timeOrISO, { zone: timezone });
      } else {
        // Slot string like "11:00 AM"
        dt = DateTime.fromFormat(`${date} ${timeOrISO.trim()}`, 'yyyy-MM-dd hh:mm a', { zone: timezone });
      }

      if (!dt.isValid) throw new BadRequestException(`Invalid date/time: ${date} ${timeOrISO}`);

      return dt.toUTC().toJSDate();
    }

    // Parse start and end times dynamically
    const startUtc = parseToUTC(dto.date, dto.startTime || dto.slot?.split('-')[0]);
    const endUtc = parseToUTC(dto.date, dto.endTime || dto.slot?.split('-')[1]);

    // Duration in minutes
    const duration = (DateTime.fromJSDate(endUtc).diff(DateTime.fromJSDate(startUtc), 'minutes')).minutes;

    // Save in Booking model
    const booking = await this.eventBookingModel.create({
      slot: dto.slot,
      hostId: dto.hostId,
      title: dto.title,
      name: dto.name,
      email: dto.email,
      guests: dto.guests || [],
      startTime: startUtc,
      endTime: endUtc,
      duration,
      timezone,
    });

    // Fetch host from DB
    const hostFromDb = await this.userModel.findById(dto.hostId);

    // Save in Meeting model
    const meeting = await this.meetingModel.create({
      userId: hostFromDb?._id || null,
      userEmail: dto.email,
      userName: dto.name,
      meetingTitle: dto.title,
      startTime: startUtc,
      endTime: endUtc,
      duration,
      timezone,
      hosts: hostFromDb
        ? [{
          name: hostFromDb.name,
          email: hostFromDb.email,
          timeZone: hostFromDb.timeZone || timezone,
        }]
        : [],
      contacts: dto.guests || [],
      bookingSource: 'public',
      slug: uuidv4()
    });
    //  STEP 1: Collect all attendees (HOST + INVITEE)


    return {
      statusCode: 201,
      message: 'Booking saved and synced to Meeting model',
      result: { booking, meeting },
    };
  }

  async getAllUpcomingMeetings(user: any) {
    const rawUserId = user.id || user._id || user.sub;

    if (!rawUserId || !user?.email) {
      throw new BadRequestException('Invalid user');
    }

    const userObjectId =
      typeof rawUserId === 'string'
        ? new mongoose.Types.ObjectId(rawUserId)
        : rawUserId;

    const now = DateTime
      .now()
      .startOf('day')
      .toUTC()
      .toJSDate();


    // 🔹 DASHBOARD MEETINGS
    const meetings = await this.meetingModel
      .find({
        startTime: { $gte: now },
        $or: [
          { userId: userObjectId },
          { userEmail: user.email },
          { 'hosts.email': user.email },
          { 'contacts.email': user.email },
        ],
      })
      .sort({ startTime: 1 })
      .lean();

    // 🔹 PUBLIC BOOKINGS
    const bookings = await this.eventBookingModel
      .find({
        startTime: { $gte: now },
        $or: [
          { hostId: userObjectId },
          { email: user.email },

          { guests: user.email },
        ],
      })
      .sort({ startTime: 1 })
      .lean();

    const dashboardMeetings = meetings.map(m => ({
      id: m._id,
      title: m.meetingTitle,
      startTime: DateTime
        .fromJSDate(m.startTime)
        .setZone(user.timeZone || m.timezone || 'Asia/Kolkata')
        .toISO(),
      endTime: DateTime
        .fromJSDate(m.endTime)
        .setZone(user.timeZone || m.timezone || 'Asia/Kolkata')
        .toISO(),
      duration: m.duration ?? 30,
      timezone: m.timezone || 'Asia/Kolkata',
      eventTypeId: m.eventTypeId || null,
      hosts: m.hosts?.map(h => ({
        name: h.name,
        email: h.email,
        timeZone: h.timeZone || m.timezone || 'Asia/Kolkata',
      })) || [],
      contacts: m.contacts || [],
      bookingSource: 'dashboard',
    }));

    // const bookedMeetings = bookings.map(b => ({
    //   id: b._id,
    //   title: b.eventtitle ?? 'Meeting'

    //   startTime: DateTime
    //     .fromJSDate(b.startTime)
    //     .setZone(user.timeZone || b.timezone || 'Asia/Kolkata')
    //     .toISO(),
    //   endTime: DateTime
    //     .fromJSDate(b.endTime)
    //     .setZone(user.timeZone || b.timezone || 'Asia/Kolkata')
    //     .toISO(),
    //   duration: b.duration ?? 30,
    //   timezone: b.timezone || 'Asia/Kolkata',
    //   eventTypeId: b.eventTypeId || null,
    //   hosts: [{
    //     name: b.name,
    //     email: b.email,
    //     timeZone: b.timezone || 'Asia/Kolkata',
    //   }],
    //   contacts: [],
    //   bookingSource: 'public',
    // }));

    const bookedMeetings = bookings.map(b => ({
      id: b._id,
      title: b.eventtitle ?? 'Meeting', // ✅ FIX 3
      startTime: b.startTime,
      endTime: b.endTime,
      duration: b.duration ?? 30,
      timezone: b.timezone,
      hosts: [{
        name: b.name,
        email: b.email,
        timeZone: b.timezone,
      }],
      contacts: [],
      bookingSource: 'public',
    }));
    return {
      statusCode: 200,
      message: 'Upcoming meetings fetched successfully',
      data: {
        dashboardMeetings,
        bookedMeetings,
      },
    };
  }


  // async getAllUpcomingMeetings(user: any) {
  //   const userId = user.id || user._id || user.sub;

  //   if (!userId || !user?.email) {
  //     throw new BadRequestException('Invalid user');
  //   }

  //   const userObjectId = new mongoose.Types.ObjectId(userId);


  //   // const userObjectId = new mongoose.Types.ObjectId(user.id);
  //   const now = DateTime.utc().toJSDate();


  //   //  Fetch meetings from Meeting collection
  //   const meetings = await this.meetingModel.find({
  //     startTime: { $gte: now },
  //     $or: [
  //       { userId: userObjectId },
  //       { userEmail: user.email },
  //       { 'hosts.email': user.email },
  //       { 'contacts.email': user.email },
  //     ],
  //   }).sort({ startTime: 1 }).lean();

  //   //  Fetch bookings from Booking collection
  //   const bookings = await this.eventBookingModel.find({
  //     startTime: { $gte: now },
  //     $or: [
  //       { hostId: userObjectId },
  //       { email: user.email },
  //       { 'guests.email': user.email },
  //     ],
  //   }).sort({ startTime: 1 }).lean();


  //   const dashboardMeetings: UpcomingMeeting[] = [];
  //   const bookedMeetings: UpcomingMeeting[] = [];

  //   // Add Meeting collection entries
  //   for (const m of meetings) {
  //     dashboardMeetings.push({
  //       id: m._id,
  //       title: m.meetingTitle,
  //       startTime: DateTime
  //         .fromJSDate(m.startTime)
  //         .setZone(user.timeZone || m.timezone || 'Asia/Kolkata')
  //         .toISO(),

  //       endTime: DateTime
  //         .fromJSDate(m.endTime)
  //         .setZone(user.timeZone || m.timezone || 'Asia/Kolkata')
  //         .toISO(),

  //       duration: m.duration || 30,
  //       timezone: m.timezone || 'Asia/Kolkata',
  //       eventTypeId: m.eventTypeId || 'null',
  //       hosts: m.hosts?.map(h => ({
  //         name: h.name,
  //         email: h.email,

  //         timeZone: h.timeZone || m.timezone || 'Asia/Kolkata',
  //       })) || [],
  //       contacts: m.contacts || [],
  //       bookingSource: m.bookingSource || 'dashboard'
  //     });
  //   }

  //   // Add Booking collection entries as "public" meetings
  //   for (const b of bookings) {

  //     bookedMeetings.push({
  //       id: b._id,
  //       title: b.eventtitle ?? 'Meeting',
  //       startTime: b.startTime,
  //       endTime: b.endTime,
  //       duration: b.duration || 30,
  //       timezone: b.timezone || 'Asia/Kolkata',
  //       eventTypeId: b.eventTypeId || 'null',
  //       hosts: [{
  //         name: b.name,
  //         email: b.email,
  //         timeZone: b.timezone || 'Asia/Kolkata',
  //       }],
  //       contacts: [],
  //       bookingSource: 'public',
  //     });
  //   }

  //   return {
  //     statusCode: 200,
  //     message: 'Upcoming meetings fetched successfully',
  //     data: {
  //       dashboardMeetings,
  //       bookedMeetings,
  //     },
  //   };
  // }



  // --------- GET PAST MEETINGS ----
  async getPastMeetings(userEmail: string) {
    return this.meetingModel.find({
      userEmail,
      endTime: { $lt: new Date() },
    });
  }


  // -------- GET MEETING BY ID --------
  async getMeetingById(id: string, userEmail: string) {
    const trimmedId = id.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) throw new BadRequestException('Invalid meeting ID');

    const meeting = await this.meetingModel.findOne({ _id: trimmedId, userEmail });
    if (!meeting) throw new NotFoundException('Meeting not found');

    return meeting;
  }

  // -------- RESCHEDULE MEETING --------
  async rescheduleMeeting(id: string, dto: RescheduleMeetingDto, user: any) {
    id = id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const email = user.email;

    const userId =
      user.id || user._id || user.sub
        ? new mongoose.Types.ObjectId(user.id || user._id || user.sub)
        : null;

    let meeting = await this.meetingModel.findOne({
      _id: id,
      $or: [
        { userId },                     // ✅ OWNER
        { userEmail: email },           // ✅ OWNER EMAIL
        { 'hosts.email': email },       // ✅ HOST
        { 'contacts.email': email },    // ✅ INVITEE
      ],
    });


    // 2️⃣ Try public Booking
    if (!meeting) {
      const booking = await this.eventBookingModel.findOne({
        _id: id,
        $or: [
          { hostId: userId },
          { email },
          { 'guests.email': email }, // ✅ FIXED
        ],
      });

      if (!booking) {
        throw new NotFoundException('Meeting not found or access denied');
      }

      const start = DateTime.fromFormat(
        `${dto.selectedDate} ${dto.selectedTime}`,
        'yyyy-MM-dd HH:mm',
        { zone: booking.timezone || 'Asia/Kolkata' },
      );

      if (!start.isValid) {
        throw new BadRequestException('Invalid date or time');
      }

      const duration = dto.duration ?? booking.duration;

      booking.startTime = start.toUTC().toJSDate();
      booking.endTime = start.plus({ minutes: duration }).toUTC().toJSDate();
      booking.duration = duration;

      await booking.save();

      return {
        statusCode: 200,
        message: 'Public meeting rescheduled successfully',
        data: booking,
      };
    }

    // 3️⃣ Update dashboard meeting
    const start = DateTime.fromFormat(
      `${dto.selectedDate} ${dto.selectedTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: meeting.timezone || 'Asia/Kolkata' },
    );

    if (!start.isValid) {
      throw new BadRequestException('Invalid date or time');
    }

    const duration = dto.duration ?? meeting.duration;

    meeting.startTime = start.toUTC().toJSDate();
    meeting.endTime = start.plus({ minutes: duration }).toUTC().toJSDate();
    meeting.selectedDate = dto.selectedDate;
    meeting.selectedTime = dto.selectedTime;
    meeting.duration = duration;

    if (dto.reasonForChange) meeting.rescheduleReason = dto.reasonForChange;
    if (dto.preparationNotes) meeting.contactQuestions = [dto.preparationNotes];

    await meeting.save();

    return {
      statusCode: 200,
      message: 'Meeting rescheduled successfully',
      data: meeting,
    };
  }



  // -------- DELETE MEETING --------
  async deleteMeeting(id: string, userEmail: string) {
    const meeting = await this.meetingModel.findOneAndDelete({ _id: id, userEmail });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  // -------- GET TIME SLOTS --------
  getTimeSlots(date: string, duration: number, timeZone: string = 'Asia/Kolkata') {
    const slots: string[] = [];
    let start = DateTime.fromISO(date, { zone: timeZone }).startOf('day');
    const end = start.endOf('day');

    while (start <= end) {
      slots.push(start.toISO());
      start = start.plus({ minutes: duration });
    }

    return { date, slots };
  }


  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(' Google Token Error:', error.response?.data);
      throw new InternalServerErrorException(
        'Failed to generate Google access token',
      );
    }
  }
}