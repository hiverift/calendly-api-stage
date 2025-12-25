// schedule.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { CreateAvailabilityDto } from 'src/available/dto/create-available.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Post()
  async createSchedule(@Body() dto: CreateScheduleDto) {
    const schedule = await this.scheduleService.createSchedule(dto, true); // true → default schedule
    return {
      statusCode: 201,
      message: 'Schedule created successfully',
      result: schedule,
    }
  }

 @Get()
  getAll() {
    return this.scheduleService.getAllSchedules();
  }
}
