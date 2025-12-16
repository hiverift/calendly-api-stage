// // // schedule.module.ts
// // import { Module } from '@nestjs/common';
// // import { MongooseModule } from '@nestjs/mongoose';
// // import { ScheduleService } from './schedule.service';
// // import { ScheduleController } from './schedule.controller';
// // import { Schedule, ScheduleSchema } from './entities/schedule.entity';

// // @Module({
// //   imports: [MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }])],
// //   controllers: [ScheduleController],
// //   providers: [ScheduleService],
// // })
// // export class ScheduleModule {}
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ScheduleService } from './schedule.service';
// import { ScheduleController } from './schedule.controller';
// import { Schedule, ScheduleSchema, Slot, SlotSchema, RecurringSlot, RecurringSlotSchema, DateOverride, DateOverrideSchema } from './entities/schedule.entity';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: Schedule.name, schema: ScheduleSchema },
//       { name: Slot.name, schema: SlotSchema },
//       { name: RecurringSlot.name, schema: RecurringSlotSchema },
//       { name: DateOverride.name, schema: DateOverrideSchema },
//     ]),
//   ],
//   controllers: [ScheduleController],
//   providers: [ScheduleService],
//   exports: [ScheduleService],
// })
// export class ScheduleModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import {
  Schedule, ScheduleSchema,
  Slot, SlotSchema,
  RecurringSlot, RecurringSlotSchema,
  DateOverride, DateOverrideSchema
} from './entities/schedule.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Slot.name, schema: SlotSchema },
      { name: RecurringSlot.name, schema: RecurringSlotSchema },
      { name: DateOverride.name, schema: DateOverrideSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
