// create-schedule.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  name?: string;
}
