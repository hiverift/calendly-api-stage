import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateSlotDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsArray()
    slots?: string[];

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    @IsOptional()
    duration?: number;
}
