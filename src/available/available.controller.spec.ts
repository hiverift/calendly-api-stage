import { Test, TestingModule } from '@nestjs/testing';
import { AvailableController } from './available.controller';
import { AvailableService } from './available.service';

describe('AvailableController', () => {
  let controller: AvailableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailableController],
      providers: [AvailableService],
    }).compile();

    controller = module.get<AvailableController>(AvailableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
