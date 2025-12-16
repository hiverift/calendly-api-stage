import { Test, TestingModule } from '@nestjs/testing';
import { EventTypesController } from './event.controller';
import { EventTypesService} from './event.service';

describe('EventController', () => {
  let controller: EventTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTypesController],
      providers: [EventTypesService],
    }).compile();

    controller = module.get<EventTypesController>(EventTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
