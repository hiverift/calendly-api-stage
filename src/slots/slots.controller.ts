
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpStatus,
  Delete,
  BadRequestException,
  Patch,
  Param,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { getDatesFromOption } from '../utils/date-helper';
import { generateSlots } from 'src/utils/slot-generator';
import { DateTime } from 'luxon';

@Controller('events/:eventId/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) { }

  // CREATE SLOTS
  // @Post()
  // async saveSlots(
  //   @Param('eventId') eventId: string,
  //   @Body() body: any,
  // ) {

  //   //  Determine final dates
  //   let finalDates: string[];
  //   const timezone = body.timezone || 'America/New_York';

  //   if (body.dateOption) {
  //     finalDates = getDatesFromOption(body.dateOption, timezone);
  //   } else if (Array.isArray(body.dates)) {
  //     finalDates = body.dates;
  //   } else if (typeof body.date === 'string') {
  //     finalDates = [body.date];
  //   } else {
  //     throw new BadRequestException('Either dateOption, dates[] or date is required');
  //   }

  //   //  Save slots with timezone info per date
  //   const payload = finalDates.map(dateStr => {
  //     const dateInTZ = DateTime.fromISO(dateStr, { zone: timezone }).startOf('day');

  //     // Generate daily slots if not provided
  //     const dailySlots = body.slots && Array.isArray(body.slots) && body.slots.length > 0
  //       ? body.slots
  //       : (() => {
  //         if (!body.startTime || !body.endTime || !body.duration) {
  //           throw new BadRequestException(
  //             'startTime, endTime, and duration are required if slots are not provided',
  //           );
  //         }
  //         const generated = generateSlots(
  //           [{ start: body.startTime, end: body.endTime }],
  //           body.duration,
  //           dateStr,
  //           timezone,
  //         );
  //         return generated.map(s => s.label);
  //       })();

  //     return {
  //       eventId,
  //       date: dateInTZ.toUTC().toJSDate(), // store UTC for DB
  //       timezone,                          // save host timezone
  //       slots: dailySlots,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     };
  //   });

  //   const savedSlots = await this.slotsService.saveSlots(eventId, payload);

  //   return {
  //     statusCode: 201,
  //     message: 'Slots created successfully',
  //     result: savedSlots,
  //   };
  // }

  @Post()
  async saveSlots(
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    // Directly send body to service
    const savedSlots = await this.slotsService.saveSlots(eventId, body);

    return {
      statusCode: 201,
      message: 'Slots created successfully',
      result: savedSlots,
    };
  }

  // @Get()
  // async getSlots(
  //   @Param('eventId') eventId: string,
  //   @Query('date') date?: string,
  //   @Query('dateOption') dateOption?: 'next_3_days' | 'next_5_days' | 'this_week' | 'next_week',

  //   @Query('timezone') timezone?: string,
  // ) {
  //   const userTimezone = timezone || 'Asia/Kolkata';

  //   const slots = await this.slotsService.getSlots(
  //     eventId,
  //     date,
  //     dateOption,
  //     undefined,
  //     undefined,
  //     userTimezone,
  //   );

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'Slots fetched successfully',
  //     result: slots,
  //   };
  // }


  @Get()
  async getSlots(
    @Param('eventId') eventId: string,
    @Query('dateOption') dateOption?: string,
    @Query('date') date?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('timezone') timezone?: string,
  ) {
    const userTimezone = timezone || 'Asia/Kolkata';

    const slots = await this.slotsService.getSlots(
      eventId,
      date,
      dateOption,
      from,
      to,
      userTimezone,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Slots fetched successfully',
      result: slots,
    };
  }

  // UPDATE SLOTS
  @Patch()
  async updateSlots(
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    const result = await this.slotsService.updateSlots(eventId, body);

    return {
      statusCode: 200,
      message: 'Slots updated successfully',
      result,
    };
  }

  // DELETE SLOTS
  @Delete()
  async deleteSlots(
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    const result = await this.slotsService.deleteSlots(eventId, body);

    return {
      statusCode: 200,
      message: 'Slots deleted successfully',
      result,
    };
  }
}
