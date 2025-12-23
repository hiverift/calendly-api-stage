import { IsOptional, IsString, IsEmail } from 'class-validator';

export class CallDetailsDto {

  //  when INVITEE_CALLS_HOST
  @IsOptional()
  @IsString()
  hostPhone?: string;

  @IsOptional()
  @IsEmail()
  hostEmail?: string;

  //  when HOST_CALLS_INVITEE
  @IsOptional()
  @IsString()
  inviteePhone?: string;

  @IsOptional()
  @IsEmail()
  inviteeEmail?: string;

  //  optional extra info (extension, bridge etc.)
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
