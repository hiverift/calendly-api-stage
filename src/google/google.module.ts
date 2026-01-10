import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.Controller';

@Module({
  providers: [GoogleService],
  exports: [GoogleService], // <-- allows other modules to inject it
  controllers: [GoogleController],
})
export class GoogleModule {}
