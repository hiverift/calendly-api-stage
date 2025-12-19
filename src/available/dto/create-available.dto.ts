
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAvailabilityDto {
   @IsNotEmpty()
   @IsString()
  scheduleId: string;

  @IsOptional()
  @IsString()
  name?: string;

  // Single date (backward compatibility)
  @IsOptional()
  @IsString()
  date?: string;

  //  Multiple dates
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  dates?: string[];

  @IsArray()
  slots: {
    start: string;
    end: string;
  }[];

  @IsOptional()
  @IsString()
  timezone?: string;
}
