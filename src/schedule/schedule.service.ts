
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SendEmailDto } from './dto/send-email.dto';
import * as nodemailer from 'nodemailer';
import { info } from 'console';


@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) { }

  // 🔹 User specific schedule
  async createSchedule(dto: CreateScheduleDto, userId: string) {
    const existing = await this.scheduleModel.findOne({
      name: dto.name,
      userId,
    });

    if (existing) {
      throw new BadRequestException('Schedule name already exists');
    }

    return this.scheduleModel.create({
      name: dto.name,
      userId,
      isDefault: false,
      timezone: 'Asia/Kolkata',
    });
  }

  // GLOBAL DEFAULT SCHEDULE (FOR ALL USERS)
  async getOrCreateDefaultSchedule() {
    return this.scheduleModel.findOneAndUpdate(
      { isDefault: true, userId: null },
      {
        $setOnInsert: {
          name: 'Default Schedule',
          isDefault: true,
          userId: null,
          timezone: 'Asia/Kolkata',
          recurring: [],
          dateOverrides: [],
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  //  Get schedules for UI dropdown
  async getAllSchedules(userId?: string) {
    return this.scheduleModel
      .find({
        $or: [
          { userId },
          { isDefault: true },
        ],
      })
      .select('_id name isDefault')
      .lean()
      .exec();
  }


  async sendEmail(dto: SendEmailDto) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // const mailOptions = {
    //   from: process.env.SMTP_USER,  // use SMTP_USER here
    //   to: dto.to,
    //   subject: dto.subject,
    //   text: dto.body,
    // };
    const mailOptions = {
      from: process.env.SMTP_USER, // sender
      to: dto.to,
      cc: dto.cc,   // optional
      bcc: dto.bcc, // optional
      subject: dto.subject,
      text: dto.body,
    };

    try {
      const info = await transporter.sendMail(mailOptions); // <-- capture Nodemailer response

      if (dto.sendReminder) {
        console.log(`Reminder will be sent after ${dto.reminderAfterDays} days`);
        // Later: integrate with cron job or DB check for unscheduled recipients
      }

      return {
        message: 'Email sent successfully',
        result: {
          accepted: info.accepted,
          rejected: info.rejected,
          messageId: info.messageId,
          recipients: {
            to: dto.to,
            cc: dto.cc || [],
            bcc: dto.bcc || [],
          },
        },
      };

    } catch (err) {
      console.error('Email send error:', err);
      throw new BadRequestException('Failed to send email');
    }
  }
}
