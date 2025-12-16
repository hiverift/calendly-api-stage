import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  slot: string;

  @IsString()
  @IsNotEmpty()
  inviteePhone: string;

  @IsString()
  @IsNotEmpty()
  hostId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  answers?: any;
}
