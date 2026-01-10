import { IsEmail, IsString, IsBoolean, IsOptional, IsNumber, IsArray } from 'class-validator';

export class SendEmailDto {
    @IsEmail()
    to: string;

    @IsString()
    subject: string;

    @IsString()
    body: string;

    @IsBoolean()
    @IsOptional()
    sendReminder?: boolean = false;

    @IsNumber()
    @IsOptional()
    reminderAfterDays?: number = 3;

    @IsOptional()
    @IsEmail({}, { each: true })
    cc?: string | string[];

    @IsOptional()
    @IsEmail({}, { each: true })
    bcc?: string | string[];
}
