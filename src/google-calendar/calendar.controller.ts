import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req ,Headers} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import express from 'express';

@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) { }

  @Get('busy')
  async getBusy(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.calendarService.getBusySlots(from, to);
  }

    @Post('create')
  async createEvent(
    @Body()
    body: {
      summary: string;
      description?: string;
      start: string;
      end: string;
      attendees?: { email: string }[];
    },
  ) {
    return this.calendarService.createEvent(body);
  }
 @Post('webhook')
  handleGoogleWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    console.log('🔔 Webhook Headers:', headers);
    console.log('📦 Webhook Body:', req.body);

    return { status: 'ok' };
  }

  @Get('events')
  async getEvents(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.calendarService.getEvents(from, to);
  }

  @Patch('update/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() body: {
      summary?: string;
      description?: string;
      start?: string;
      end?: string;
    },
  ) {
    return this.calendarService.updateEvent(eventId, body);
  }

  // CalendarController.ts
  @Delete('delete/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return this.calendarService.deleteEvent(eventId);
  }

   @Patch('cancel/:eventId')
  async cancelEvent(
    @Param('eventId') eventId: string,
    @Body() body: { cancelReason: string },
  ) {
    return this.calendarService.cancelEvent(
      eventId,
      body.cancelReason,
    );
  }

}
