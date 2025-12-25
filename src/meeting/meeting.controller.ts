
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MeetingsService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { RescheduleMeetingDto } from './dto/reschedule-meeting.dto';
import { MeetingResponseDto } from './dto/meeting-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Public } from 'src/auth/decorators/public.decorator';


@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) { }

  /** Book meeting */
  @Post('book')
  bookMeeting(@Body() dto: CreateMeetingDto, @Req() req) {
    return this.meetingsService.bookMeeting(req.user, dto);
  }
  @Get('time-slots')
  @Public()
  getTimeSlots(@Query('date') date: string, @Query('duration') duration: string) {
    return {
      statusCode: 200,
      message: 'Time slots generated successfully',
      data: this.meetingsService.getTimeSlots(date, Number(duration)),
    };
  }

  /** Get past meetings */
  @Get('past')
  async getPastMeetings(@Req() req): Promise<MeetingResponseDto> {
    const meetings = await this.meetingsService.getPastMeetings(req.user.email);

    return {
      statusCode: 200,
      message: 'Past meetings fetched successfully',
      data: meetings,
    };
  }

  /** Get upcoming meetings */
  @Get('upcoming')
  async getUpcomingMeetings(@Req() req): Promise<MeetingResponseDto> {
    const meetings = await this.meetingsService.getUpcomingMeetings(
      req.user.email,
    );

    return {
      statusCode: 200,
      message: 'Upcoming meetings fetched successfully',
      data: meetings,
    };
  }

  /** Get meeting by ID */
  @Get(':id')
  async getMeetingById(
    @Param('id') id: string,
    @Req() req,
  ): Promise<MeetingResponseDto> {
    const meeting = await this.meetingsService.getMeetingById(
      id,
      req.user.email,
    );

    return {
      statusCode: 200,
      message: 'Meeting fetched successfully',
      data: meeting,
    };
  }

  /** Delete meeting */
  @Delete(':id')
  async deleteMeeting(
    @Param('id') id: string,
    @Req() req,
  ): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.deleteMeeting(id, req.user.email);

    return {
      statusCode: 200,
      message: 'Meeting deleted successfully',
      data: result,
    };
  }

  /** Reschedule meeting */
  @Patch(':id/reschedule')

  async rescheduleMeeting(
    @Param('id') id: string,
    @Body() dto: RescheduleMeetingDto,
    @Req() req,
  ): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.rescheduleMeeting(
      id,
      dto,
      req.user.email,
      //  dto.email,
    );

    return {
      statusCode: 200,
      message: 'Meeting rescheduled successfully',
      data: result,
    };
  }

  /** Time slots (public / internal utility) */
  // @Get('time-slots')
  // getTimeSlots(@Query('date') date: string, @Query('duration') duration: string) {
  //   return {
  //     statusCode: 200,
  //     message: 'Time slots generated successfully',
  //     data: this.meetingsService.getTimeSlots(date, Number(duration)),
  //   };
  // }
}
