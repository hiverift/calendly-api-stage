
// import { BadRequestException, Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Get, Param } from '@nestjs/common';
// import { AvailabilityService } from './available.service';
// import { CreateAvailabilityDto } from './dto/create-available.dto';

// @Controller('availability')
// @UseGuards(AuthGuard('jwt'))
// export class AvailabilityController {
//   constructor(private readonly availabilityService: AvailabilityService) {}
// @Post()
// async createAvailability(
//   @Body() body: CreateAvailabilityDto,
//   @Req() req,
// ) {
//   const data = await this.availabilityService.create(
//     body,
//     req.user.id,
//   );

//   return {
//     statusCode: 201,
//     message: 'Availability created successfully',
//     result: data,
//   };
// }

  
// @Get('schedule/:scheduleId')
// async getAvailabilityBySchedule(
//   @Param('scheduleId') scheduleId: string,
//   @Req() req,
// ) {
//   const data = await this.availabilityService.getByScheduleId(
//     scheduleId,
//     req.user.id,
//   );

//   return {
//     statusCode: 200,
//     message: 'Availability fetched successfully',
//     result: data,
//   };
// }

// @Get()
// async getByMonth(
//   @Query('month') month: string,
//   @Query('scheduleId') scheduleId: string,
//   @Query('eventId') eventId: string,
//   @Query('useGoogleCalendar') useGoogleCalendar: string,
//   @Req() req,
// ) {
//   const data = await this.availabilityService.getByMonth(
//     month,
//     req.user.id,
//     scheduleId,
//     useGoogleCalendar === 'true',
//     eventId,
//   );

//   return {
//     statusCode: 200,
//     message: 'Monthly availability fetched successfully',
//     result: data, // REAL DATA
//   };
// }



// }
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './available.service';
import { CreateAvailabilityDto } from './dto/create-available.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}


@Post()
async createAvailability(
  @Query('weekly') weekly: string,
  @Body() dto: CreateAvailabilityDto,
) {
  //  Create availability
  const createdData = await this.availabilityService.create(dto);

  //  Weekly response if requested
  if (weekly === 'true') {
    const weeklyData = await this.availabilityService.getWeeklyAvailability(
      dto.scheduleId,
    );

    return {
      statusCode: 201,
      message: 'Availability created successfully',
      result: weeklyData,
    };
  }

  return {
    statusCode: 201,
    message: 'Availability created successfully',
    result: createdData,
  };
}


@Get('schedule/:scheduleId')
async getAvailabilityBySchedule(@Param('scheduleId') scheduleId: string) {
  const data = await this.availabilityService.getByScheduleId(scheduleId);

  return {
    statusCode: 200,
    message: 'Availability fetched successfully',
    result: data,
  };
}

@Get('weekly/:scheduleId')
async getWeeklyAvailability(@Param('scheduleId') scheduleId: string) {
  const data = await this.availabilityService.getWeeklyAvailability(scheduleId);

  return {
    statusCode: 200,
    message: 'Weekly availability fetched successfully',
    result: data,
  };
}

@Get()
async getByMonth(
  @Query('month') month: string,
  @Query('scheduleId') scheduleId: string,
  @Query('eventId') eventId?: string,
  @Query('useGoogleCalendar') useGoogleCalendar?: string,
) {
  const data = await this.availabilityService.getByMonth(
    month,
    scheduleId,
    useGoogleCalendar === 'true',
    eventId,
  );

  return {
    statusCode: 200,
    message: 'Monthly availability fetched successfully',
    result: data,
  };
}
}
