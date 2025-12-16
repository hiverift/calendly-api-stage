import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  // ADD THESE ↓ ↓ ↓
  @IsOptional()
  @IsString()
  otp?: string | null;

  @IsOptional()
  otpExpires?: Date |null;
}
