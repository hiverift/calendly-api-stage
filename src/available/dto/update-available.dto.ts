import { PartialType } from '@nestjs/mapped-types';
import { CreateAvailabilityDto } from './create-available.dto';

export class UpdateAvailableDto extends PartialType(CreateAvailabilityDto) {
    eventId?: string;

}
