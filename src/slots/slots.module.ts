import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';
import { Slot, SlotSchema } from './entities/slot.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slot.name, schema: SlotSchema },
    ]),
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}
