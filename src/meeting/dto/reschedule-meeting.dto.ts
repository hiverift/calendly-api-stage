// // export class RescheduleMeetingDto {
// //   selectedDate: string; // e.g., '2025-12-12'
// //   selectedTime: string; // e.g., '03:30 PM'
// //   duration?: number;    // optional, in minutes
// // }
// import { IsString, IsOptional, IsNumber } from 'class-validator';

// export class RescheduleMeetingDto {
//   @IsString()
//   selectedDate: string;

//   @IsString()
//   selectedTime: string;

//   @IsOptional()
//   @IsNumber()
//   duration?: number;
// }
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
