
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MeetingsService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';
import type { Meeting } from './dto/meeting.dto'; // use `import type` to avoid TS4053
import { MeetingResponseDto } from './dto/meeting-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) { }

  @Post('book')
@UseGuards(AuthGuard('jwt'))
bookMeeting(
  @Body() dto: CreateMeetingDto,
  @Req() req,
) {
  return this.meetingsService.bookMeeting(req.user, dto);
}



  // @Post('book')
  // async bookMeeting(@Body() createMeetingDto: CreateMeetingDto): Promise<MeetingResponseDto> {
  //   const result = await this.meetingsService.bookMeeting(createMeetingDto);
  //   return {
  //     statusCode: result.statusCode,
  //     message: result.message,
  //     data: result.data,
  //   };
  // }

  // @Get('past')
  // async getPastMeetings(@Query('email') email: string): Promise<MeetingResponseDto> {
  //   const meetings: Meeting[] = await this.meetingsService.getPastMeetings(email);
  //   return {
  //     statusCode: 200,
  //     message: 'Past meetings fetched successfully',
  //     data: meetings,
  //   };
  // }
  //   @Get('past')
  // async getPastMeetings(
  //   @Query('email') email: string,
  // ): Promise<MeetingResponseDto> {
  //   const meetings = await this.meetingsService.getPastMeetings(email);

  //   return {
  //     statusCode: 200,
  //     message: 'Past meetings fetched successfully',
  //     data: meetings,
  //   };
  // }
  @UseGuards(JwtAuthGuard)
  @Get('past')
  async getPastMeetings(@Req() req): Promise<MeetingResponseDto> {

    const meetings = await this.meetingsService.getPastMeetings(
      req.user.email, //  logged-in user
    );

    return {
      statusCode: 200,
      message: 'Past meetings fetched successfully',
      data: meetings,
    };
  }



  @Get('time-slots')
  async getTimeSlots(
    @Query('date') date: string,
    @Query('duration') duration: string,
  ): Promise<MeetingResponseDto> {
    const data = this.meetingsService.getTimeSlots(date, Number(duration));
    return {
      statusCode: 200,
      message: 'Time slots generated successfully',
      data,
    };
  }

  @Delete(':id')
  async deleteMeeting(@Param('id') id: string): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.deleteMeeting(id);
    return {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    };
  }

  @Patch(':id')
  async rescheduleMeeting(@Param('id') id: string, @Body() dto: RescheduleMeetingDto): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.rescheduleMeeting(id, dto);
    return {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    };
  }
}
