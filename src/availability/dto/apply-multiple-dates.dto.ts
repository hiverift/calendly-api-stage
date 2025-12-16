// import { IsArray, ArrayNotEmpty, Matches, IsString, IsOptional } from 'class-validator';

// export class ApplyMultiDatesDto {
//   @IsArray() @ArrayNotEmpty() @Matches(/^\d{4}-\d{2}-\d{2}$/, { each: true }) dates: string[];
//   @Matches(/^\d{2}:\d{2}$/) start: string;
//   @Matches(/^\d{2}:\d{2}$/) end: string;
//   @IsOptional() type?: 'available' | 'unavailable';
// }
import {
  IsArray,
  ArrayNotEmpty,
  Matches,
  IsOptional,
  ValidateIf,
  IsBoolean,
} from 'class-validator';

export class TimeSlotDto {
  @Matches(/^\d{2}:\d{2}$/)
  start: string;

  @Matches(/^\d{2}:\d{2}$/)
  end: string;
}

export class ApplyMultiDatesDto {
  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { each: true })
  dates: string[];

  // When assigning hours
  @ValidateIf(o => !o.isUnavailable)
  @IsArray()
  @ArrayNotEmpty()
  slots?: TimeSlotDto[];

  // When blocking whole day
  @IsOptional()
  @IsBoolean()
  isUnavailable?: boolean;
}
