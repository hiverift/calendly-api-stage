import { IsOptional, IsString, IsEmail } from 'class-validator';

export class CallDetailsDto {

  //  when INVITEE_CALLS_HOST
  @IsOptional()
  @IsString()
  hostPhone?: string;

  @IsOptional()
  @IsString()
  hostphone?: string;

  //  when HOST_CALLS_INVITEE
  @IsOptional()
  @IsString()
  inviteePhone?: string;

  @IsOptional()
  @IsEmail()
  inviteeEmail?: string;

  //  extra info (extension, bridge etc.)
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
