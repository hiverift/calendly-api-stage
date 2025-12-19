
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
    return {
      success: true,
      data: await this.availabilityService.create(
        body,
        req.user.id,
      ),
    };
  }
  @Get('schedule/:scheduleId')
async getAvailabilityBySchedule(
  @Param('scheduleId') scheduleId: string,
  @Req() req,
) {
  return {
    success: true,
    data: await this.availabilityService.getByScheduleId(
      scheduleId,
      req.user.id,
    ),
  };
}
@Get()
getMonthAvailability(
  @Query('month') month: string,
  @Query('scheduleId') scheduleId: string, // OPTIONAL
  @Req() req,
) {
  return this.availabilityService.getByMonth(
    month,
    req.user._id,
    scheduleId || undefined,
  );
}

}
