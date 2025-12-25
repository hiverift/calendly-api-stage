import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  slot: string;
  @IsOptional()
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

  @IsArray()
  @IsOptional()
  guests?: string[];

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  answers?: any;
}
