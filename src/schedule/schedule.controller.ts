// // // // schedule.controller.ts
// // // import { Controller, Get, Post, Body } from '@nestjs/common';
// // // import { ScheduleService } from './schedule.service';
// // // import { CreateScheduleDto } from './dto/create-schedule.dto';
// // // import { CreateAvailabilityDto } from 'src/available/dto/create-available.dto';

// // // @Controller('schedules')
// // // export class ScheduleController {
// // //   constructor(private readonly scheduleService: ScheduleService) { }

// // //   @Post()
// // //   async createSchedule(@Body() dto: CreateScheduleDto) {
// // //     const schedule = await this.scheduleService.createSchedule(dto, true); 
// // //     return {
// // //       statusCode: 201,
// // //       message: 'Schedule created successfully',
// // //       result: schedule,
// // //     }
// // //   }

// // //  @Get()
// // //   getAll() {
// // //     return this.scheduleService.getAllSchedules();
// // //   }
// // // }
// // import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
// // import { ScheduleService } from './schedule.service';
// // import { CreateScheduleDto } from './dto/create-schedule.dto';
// // import { JwtAuthGuard } from '../auth/guards/jwt.guard';

// // @Controller('schedules')
// // @UseGuards(JwtAuthGuard)
// // export class ScheduleController {
// //   constructor(private readonly scheduleService: ScheduleService) { }

// //   @Post()
// //   async createSchedule(
// //     @Body() dto: CreateScheduleDto,
// //     @Req() req,
// //   ) {
// //     return {
// //       statusCode: 201,
// //       message: 'Schedule created successfully',
// //       result: await this.scheduleService.createSchedule(
// //         dto,
// //         req.user.id,   // ✅ userId yahin se jaayega
// //         false,          // isDefault
// //       ),
// //     };
// //   }
// //   @Get('default')
// //   async getDefaultSchedule(@Req() req) {
// //     const schedule = await this.scheduleService.createDefaultSchedule(req.user.id);
// //     return {
// //       statusCode: 200,
// //       message: 'Default schedule retrieved',
// //       result: schedule,
// //     };
// //   }

// //   @Get()
// //   getAll() {
// //     return this.scheduleService.getAllSchedules();
// //   }
// // }
// import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
// import { ScheduleService } from './schedule.service';
// import { CreateScheduleDto } from './dto/create-schedule.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt.guard';

// @Controller('schedules')
// @UseGuards(JwtAuthGuard)
// export class ScheduleController {
//   constructor(private readonly scheduleService: ScheduleService) {}

//   // User creates normal schedule
//   @Post()
//   async createSchedule(@Body() dto: CreateScheduleDto, @Req() req) {
//     const schedule = await this.scheduleService.createSchedule(dto, req.user.id, false);

//     // Here you can attach availability if needed
//     // await this.availabilityService.createAvailability(schedule._id, req.body.slots);

//     return {
//       statusCode: 201,
//       message: 'Schedule created successfully',
//       result: schedule,
//     };
//   }

//   // Default schedule retrieval / creation
//   @Get('default')
// async getDefaultSchedule() {
//   const schedule = await this.scheduleService.createDefaultSchedule();

//   return {
//     statusCode: 200,
//     message: 'Default schedule retrieved',
//     result: schedule,
//   };
// }


//   // Get all schedules for logged-in user
//   @Get()
//   getAll(@Req() req) {
//     return this.scheduleService.getAllSchedules(req.user.id);
//   }
// }
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  // Create user schedule
  @Post()
  async createSchedule(@Body() dto: CreateScheduleDto, @Req() req) {
    const schedule = await this.scheduleService.createSchedule(
      dto,
      req.user.id,
    );

    return {
      statusCode: 201,
      message: 'Schedule created successfully',
      result: schedule,
    };
  }
  @Post('send-email')
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.scheduleService.sendEmail(dto);

    // If sendReminder is true, schedule a reminder
    if (dto.sendReminder && dto.reminderAfterDays) {
      const delay = dto.reminderAfterDays * 24 * 60 * 60 * 1000; // days → ms
      setTimeout(async () => {
        try {
          await this.scheduleService.sendEmail({
            ...dto,
            subject: `Reminder: ${dto.subject}`,
          });
          console.log(`Reminder email sent to ${dto.to}`);
        } catch (err) {
          console.error('Failed to send reminder email:', err);
        }
      }, delay);
    }

    return result; // returns full Nodemailer/Gmail info
  }

  //Global default schedule
  @Get('default')
  async getDefaultSchedule() {
    const schedule = await this.scheduleService.getOrCreateDefaultSchedule();
    return {
      statusCode: 200,
      message: 'Default schedule retrieved',
      result: schedule,
    };
  }

  //  Dropdown list
  @Get()
  async getAll(@Req() req) {
    return this.scheduleService.getAllSchedules(req.user.id);
  }
}
