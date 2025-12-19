// // schedule.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Schedule, ScheduleDocument } from './entities/schedule.entity';
// import { CreateScheduleDto } from './dto/create-schedule.dto';

// @Injectable()
// export class ScheduleService {
//   constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) { }


//   async createSchedule(dto: CreateScheduleDto, isDefault = false): Promise<Schedule> {
//     const existing = await this.scheduleModel.findOne({ name: dto.name, isDefault });
//     if (existing) throw new Error('Schedule name already exists');
//     const now = new Date();

//     const schedule = new this.scheduleModel({
//       name: dto.name,
//       startTime: now,
//       endTime: new Date(now.getTime() + 60 * 60 * 1000), // +1 hour
//       description: `Schedule for ${dto.name}`,
//       isDefault, // store default flag
//     });

//     return schedule.save();
//   }


//   async getAllSchedules(): Promise<Schedule[]> {
//     return this.scheduleModel.find().sort({ startTime: 1 }).exec();
//   }
// }
 import { Injectable, BadRequestException } from '@nestjs/common';
 import { InjectModel } from '@nestjs/mongoose';
 import { Model } from 'mongoose';
 import { Schedule, ScheduleDocument } from './entities/schedule.entity';
 import { CreateScheduleDto } from './dto/create-schedule.dto';

 @Injectable()
export class ScheduleService {
   constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) {}

  async createSchedule(dto: CreateScheduleDto, isDefault = false): Promise<Schedule> {
    //  Check if schedule already exists
     const existing = await this.scheduleModel.findOne({ name: dto.name, isDefault });
     if (existing) throw new BadRequestException('Schedule name already exists');

    const now = new Date();

     const schedule = new this.scheduleModel({
       name: dto.name,
       startTime: now,
       endTime: new Date(now.getTime() + 60 * 60 * 1000), // +1 hour
       description: `Schedule for ${dto.name}`,
      isDefault,
    });

     return schedule.save();
  }

   async getAllSchedules() {
  return this.scheduleModel
    .find({}, { _id: 1, name: 1 }) // 👈 projection
    .sort({ startTime: 1 })
    .lean()
    .exec();
}
}
