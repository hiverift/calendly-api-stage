
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class RescheduleMeetingDto {
  @IsString()
  selectedDate: string;

  @IsString()
  selectedTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsArray()
  guests?: string[];

  @IsOptional()
  @IsString()
  reasonForChange?: string;

  @IsOptional()
  @IsString()
  preparationNotes?: string;
  
}
