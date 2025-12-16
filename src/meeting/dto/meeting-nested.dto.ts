// // src/meeting/dto/meeting-nested.dto.ts
// import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

// export class HostDto {
//   @IsString()
//   @IsNotEmpty()
//   id: string;

//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsString()
//   @IsNotEmpty()
//   timeZone: string;
// }

// export class ContactDto {
//   @IsString()
//   @IsNotEmpty()
//   id: string;

//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsEmail()
//   email: string;

//   @IsOptional()
//   @IsString()
//   phone?: string;
// }

// export class QuestionAnswerDto {
//   @IsString()
//   @IsNotEmpty()
//   question: string;

//   @IsString()
//   @IsNotEmpty()
//   answer: string;
// }
// src/meeting/dto/meeting-nested.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class HostDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  timeZone: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;  // Add this for host phone number

  @IsOptional()
  @IsString()
  phoneExtension?: string; // Add this for phone extension (optional)
}

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class QuestionAnswerDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
