import { Controller, Get } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('login')
  login() {
    const url = this.googleService.getLoginUrl();
    return { url };
  }
}
