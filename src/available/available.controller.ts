
import { BadRequestException, Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Get, Param } from '@nestjs/common';
import { AvailabilityService } from './available.service';
import { CreateAvailabilityDto } from './dto/create-available.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}
@Post()
async createAvailability(
  @Body() body: CreateAvailabilityDto,
  @Req() req,
) {
  const data = await this.availabilityService.create(
    body,
    req.user.id,
  );

  return {
    statusCode: 201,
    message: 'Availability created successfully',
    result: data,
  };
}

  
@Get('schedule/:scheduleId')
async getAvailabilityBySchedule(
  @Param('scheduleId') scheduleId: string,
  @Req() req,
) {
  const data = await this.availabilityService.getByScheduleId(
    scheduleId,
    req.user.id,
  );

  return {
    statusCode: 200,
    message: 'Availability fetched successfully',
    result: data,
  };
}

@Get()
async getByMonth(
  @Query('month') month: string,
  @Query('scheduleId') scheduleId: string,
  @Query('eventId') eventId: string,
  @Query('useGoogleCalendar') useGoogleCalendar: string,
  @Req() req,
) {
  const data = await this.availabilityService.getByMonth(
    month,
    req.user.id,
    scheduleId,
    useGoogleCalendar === 'true',
    eventId,
  );

  return {
    statusCode: 200,
    message: 'Monthly availability fetched successfully',
    result: data, // REAL DATA
  };
}



}
