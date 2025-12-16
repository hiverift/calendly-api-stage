
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Slot for recurring availability
export class SlotDto {
  @IsString() start: string; // 'HH:mm'
  @IsString() end: string;   // 'HH:mm'
}

// Recurring day with multiple slots
export class RecurringDayDto {
  @IsString() day: string; // 'Monday', 'Tuesday', etc.
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}

// Date override for single/multiple dates
export class DateOverrideDto {
  @IsString() from: string; // 'YYYY-MM-DD'
  @IsString() to: string;   // 'YYYY-MM-DD'
  @IsString() start: string; // 'HH:mm'
  @IsString() end: string;   // 'HH:mm'
  @IsOptional()
  @IsString()
  type?: 'available' | 'unavailable';
}

// DTO for creating a schedule
export class CreateScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurringDayDto)
  recurring?: RecurringDayDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateOverrideDto)
  dateOverrides?: DateOverrideDto[];
}
