import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateBookingDto {

  // optional date for timezone conversion
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  slot?: string;

  @IsOptional()
  @IsString()
  inviteePhone?: string;

  @IsOptional()
  @IsString()
  hostId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  guests?: string[];

  // frontend sends HH:mm or ISO
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  answers?: Record<string, any>;

  @IsOptional()
  @IsString()
  bookingSource?: string;
}
