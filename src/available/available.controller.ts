
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './available.service';
import { CreateAvailabilityDto, CreateEventAvailabilityDto } from './dto/create-available.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) { }

  @Post()
  async create(@Body() dto: CreateAvailabilityDto) {
    const data = await this.availabilityService.create(dto);
    return {
      statusCode: 201,
      message: 'Availability saved',
      result: data,
    };
  }

  @Post('events')
  async createForEvents(@Body() dto: CreateEventAvailabilityDto) {
    const data = await this.availabilityService.createForEvents(dto);
    return {
      statusCode: 201,
      message: 'Availability saved for events',
      result: data,
    };
  }

  @Patch(':scheduleId/user/:userId')
  async updateAvailability(
    @Param('scheduleId') scheduleId: string,
    @Param('userId') userId: string,
    @Body() body: any,
  ) {
    return this.availabilityService.update(
      scheduleId,
      userId,
      body,
    );
  }


  @Delete(':scheduleId/user/:userId')
  async deleteAvailability(
    @Param('scheduleId') scheduleId: string,
    @Param('userId') userId: string,
    @Body() body: any,
  ) {
    const data = await this.availabilityService.deleteBulk(
      scheduleId,
      userId,
      body,
    );

    return {
      statusCode: 200,
      message: 'Availability deleted',
      result: data,
    };
  }


  @Get('schedule/:scheduleId')
  async getBySchedule(@Param('scheduleId') scheduleId: string) {
    const data = await this.availabilityService.getByScheduleId(scheduleId);
    return {
      statusCode: 200,
      message: 'Schedule availability fetched',
      result: data,
    };
  }

  @Get('schedule/:scheduleId/user/:userId')
  async getByScheduleAndUser(
    @Param('scheduleId') scheduleId: string,
    @Param('userId') userId: string,
  ) {
    const data =
      await this.availabilityService.getByScheduleIdAndUserId(
        scheduleId,
        userId,
      );
    return {
      statusCode: 200,
      message: 'User schedule availability fetched',
      result: data,
    };
  }
  // @Get('events')
  // async getAvailabilityForEvents(
  //   @Query('userId') userId: string,
  //   @Query('eventId') eventId: string,
  // ) {
  //   const data = await this.availabilityService.getByEventAndUser(
  //     userId,
  //     eventId,
  //   );

  //   return {
  //     statusCode: 200,
  //     message: 'Event availability fetched',
  //     result: data,
  //   };
  // }
  @Get('events')
  async getAvailabilityForEvents(@Query('userId') userId: string, @Query('eventId') eventId: string) {
    // 🔹 here availabilityService must exist
    return this.availabilityService.getByEventAndUser(userId, eventId);
  }

  @Get('slots')
  async getSlots(
    @Query('scheduleId') scheduleId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    const data = await this.availabilityService.getSlots(
      scheduleId,
      date,
      Number(duration) || 15,
    );
    return {
      statusCode: 200,
      message: 'Available slots fetched',
      result: data,
    };
  }
}
