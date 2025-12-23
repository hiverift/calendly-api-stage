
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class RescheduleMeetingDto {
  @IsString()
  selectedDate: string;

  @IsString()
  selectedTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}
