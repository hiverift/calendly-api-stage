
// import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
// import { BookingService } from './booking.service';

// @Controller('booking')
// export class BookingController {
//   constructor(private readonly bookingService: BookingService) {}

//   //  GET available slots using slug
//   @Get('/slots/:slug')
//   getSlots(
//     @Param('slug') slug: string,
//     @Query('date') date: string,
//   ) {
//     return this.bookingService.getAvailableSlots(slug, date);
//   }

//   // Book event (public)
 
//   @Post()
//   bookEvent(@Body() body) {
//     return this.bookingService.book(body);
//   }
  
// }
import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { MeetingsService } from '../meeting/meeting.service'; // add this

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly meetingsService: MeetingsService, // ✅ inject meetingsService
  ) {}

  // @Get('/slots/:slug')
  // getSlots(@Param('slug') slug: string, @Query('date') date: string) {
  //   return this.bookingService.getAvailableSlots(slug, date);
  // }

  @Post()
  async bookEvent(@Body() body) {
    // 1️⃣ Save booking
    const bookingResult = await this.bookingService.book(body);

    // // 2️⃣ Save meeting in meetingModel
    // const meetingDto = {
    //   slot: body.slot,
    //   hostId: body.hostId,
    //   title: body.title,
    //   name: body.name,
    //   email: body.email,
    //   guests: body.guests || [],
    //   startTime: body.startTime,
    //   endTime: body.endTime,
    //   timezone: body.timezone || 'Asia/Kolkata',
    //   eventId: body.eventId,
    // };

    // await this.meetingsService.syncEventBookingToMeeting(meetingDto);

    return bookingResult;
  }
}
