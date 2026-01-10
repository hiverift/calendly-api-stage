import { Controller, Post, Get, Patch, Body, Param, Req, Delete, UseGuards } from '@nestjs/common';
import { EventTypesService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateBookingDto } from 'src/booking/dto/create-booking.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventService: EventTypesService) { }

  @Post()
  create(@Body() dto: CreateEventDto, @Req() req) {
    return this.eventService.create(dto, req.user.id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Req() req) {
    return this.eventService.duplicate(id, req.user.id, req.user.role);
  }


  @Post(':id/book')
  @Public() // now truly public, no token required
  bookEvent(@Param('id') id: string, @Body() dto: CreateBookingDto) {
    return this.eventService.bookEvent(id, dto); // remove req.user.id
  }

  @Get()
  findAll(@Req() req) {

    return this.eventService.findAll();
  }
  @Get('slug/:slug')
  @UseGuards()
  getBySlug(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }

  @Get(':id/share-link')
  @Public()
  getShareLink(@Param('id') id: string) {
    return this.eventService.generateShareLink(id);
  }

  @Get('my-events')
  getMyEvents(@Req() req) {
    return this.eventService.findByUserId(req.user.id);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  // @Get('findByUserid/:id')
  // findByUserId(@Param('id') id: string) {
  //   return this.eventService.findByUserId(id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req) {
    return this.eventService.update(id, dto, req.user.id, req.user.role);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Req() req) {
    return this.eventService.toggleEvent(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.eventService.delete(id, req.user.id, req.user.role);
  }




}

