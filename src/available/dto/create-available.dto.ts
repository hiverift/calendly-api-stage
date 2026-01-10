import { IsString, IsArray, IsOptional, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class SlotDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class WeeklyAvailabilityDto {
  @IsString()
  day: string;

  //   @IsArray()
  //   @ValidateNested({ each: true })
  //   @Type(() => SlotDto)
  //   slots: SlotDto[];
  // }
  @IsOptional() // ✅ IMPORTANT
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots?: SlotDto[]; // ✅ optional
}

class DateAvailabilityDto {
  @IsString()
  date: string;


  @IsOptional() // ✅ IMPORTANT
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots?: SlotDto[]; // ✅ optional
}


export class CreateAvailabilityDto {
  @IsOptional()
  @IsMongoId()
  scheduleId?: string;

  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyAvailabilityDto)
  weekly?: WeeklyAvailabilityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateAvailabilityDto)
  dates?: DateAvailabilityDto[];
}
export class CreateEventAvailabilityDto {
  @IsMongoId()
  userId: string;
  @IsArray()
  @IsString({ each: true })
  eventIds: string[];

  @IsOptional()
  @IsMongoId() // ✅ make scheduleId optional
  scheduleId?: string;


  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyAvailabilityDto)
  weekly?: WeeklyAvailabilityDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateAvailabilityDto)
  dates?: DateAvailabilityDto[];
}
