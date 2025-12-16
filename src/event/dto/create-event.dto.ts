
import { IsString, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class WeeklyAvailabilityDto {
  @IsString()
  day: string; // e.g., "Monday"

  @IsString()
  start: string; // e.g., "09:00"

  @IsString()
  end: string; // e.g., "17:00"
}

class SingleDayAvailabilityDto {
  @IsString()
  date: string; // e.g., "2025-12-15"

  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsNumber()
  duration: number;

  @IsString()
  mode: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyAvailabilityDto)
  weeklyAvailability?: WeeklyAvailabilityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleDayAvailabilityDto)
  singleDayAvailability?: SingleDayAvailabilityDto[];

  @IsOptional()
  maxBookingsPerDay?: number;

  @IsOptional()
  location?: string;


    @IsOptional()
  @IsArray()
  single?: Array<{
    date: string;
    start: string;
    end: string;
    available: boolean;
  }>;

    @IsString()
  locationValue: string;

    // DIRECT ARRAY — NO CLASS
  @IsOptional()
  @IsArray()
  recurring?: Array<{
    day: string;
    start: string;
    end: string;
    available: boolean;
  }>;

    @IsArray()
  questions: Array<{
    question: string;
    required: boolean;
  }>;

}

