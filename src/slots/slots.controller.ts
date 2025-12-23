
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

@Controller('events/:eventId/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  // CREATE SLOTS
  @Post()
  async saveSlots(
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    let finalDates: string[];

    if (body.dateOption) {
      finalDates = getDatesFromOption(body.dateOption, body.timezone);
    } else if (Array.isArray(body.dates)) {
      finalDates = body.dates;
    } else if (typeof body.date === 'string') {
      finalDates = [body.date];
    } else {
      throw new BadRequestException(
        'Either dateOption, dates[] or date is required',
      );
    }

    const payload = {
      ...body,
      dates: finalDates,
    };

    const slots = await this.slotsService.saveSlots(eventId, payload);

    return {
      statusCode: 201,
      message: 'Slots created successfully',
      result: slots,
    };
  }

  // GET SLOTS
  @Get()
  async getSlots(
    @Param('eventId') eventId: string,
    @Query('date') date?: string,
    @Query('dateOption') dateOption?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const slots = await this.slotsService.getSlots(
      eventId,
      date,
      dateOption,
      from,
      to,
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
