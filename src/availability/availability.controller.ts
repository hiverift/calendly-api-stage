import { Controller, Get, Put, Delete, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { Slot, RecurringSlot } from '../schedule/entities/schedule.entity';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) { }

  @Get()
  getDefaultSchedule() {
    return this.availabilityService.getDefaultSchedule();
  }
  @Get('calendar-slots')
  async getCalendarSlots(
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    return this.availabilityService.getCalendarSlots(
      date,
      duration ? Number(duration) : 30,
    );
  }

  @Put('recurring')
  updateRecurringSlots(@Body() dto: RecurringSlot[]) {
    return this.availabilityService.updateRecurringSlots(dto);
  }

  @Put('date-override')
  editDateOverride(@Body() body: { date: string; slots: Slot[]; isUnavailable?: boolean }) {
    return this.availabilityService.editDateOverride(body.date, body.slots, body.isUnavailable);
  }

  @Delete('date-override/:date')
  resetDate(@Param('date') date: string) {
    return this.availabilityService.resetDate(date);
  }

  // @Get('calendar-slots/:date')
  // getCalendarSlots(@Param('date') date: string, @Query('duration') duration: number) {
  //   return this.availabilityService.getCalendarSlots(date, duration);
  // }
  @Delete('date-override')
  async deleteDateOverride(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('date is required');
    }

    return this.availabilityService.deleteDateOverride(date);
  }

}
