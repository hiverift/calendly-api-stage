import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsService } from './meeting.service';

describe('MeetingService', () => {
  let service: MeetingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetingsService],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
