import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meeting.controller';
import { MeetingsService } from './meeting.service';

describe('MeetingController', () => {
  let controller: MeetingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [MeetingsService],
    }).compile();

    controller = module.get<MeetingsController>(MeetingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
