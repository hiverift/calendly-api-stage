
import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  //  GET available slots using slug
  @Get('/slots/:slug')
  getSlots(
    @Param('slug') slug: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableSlots(slug, date);
  }

  // Book event (public)
  @Post()
  bookEvent(@Body() body) {
    return this.bookingService.book(body);
  }
  
}
