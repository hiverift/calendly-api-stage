import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './available.controller';
import { AvailabilityService } from './available.service';

describe('AvailableController', () => {
  let controller: AvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [AvailabilityService],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
