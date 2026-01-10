
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // MULTER CONFIG
  private static multerOptions = {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, callback) => {
        const uniqueName =
          Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueName}${ext}`);
      },
    }),
  };

  // CREATE USER WITH IMAGE
  @Post()
  @UseInterceptors(FileInterceptor('profileImage', UserController.multerOptions))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: any,
  ) {
    console.log('File =>', file?.filename);
    return this.userService.create(dto, file);
  }

  // GET ALL USERS
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // GET SINGLE USER
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // UPDATE USER WITH IMAGE
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage', UserController.multerOptions))
  update(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, dto, file);
  }

  @Patch(':id/calendar-status')
  updateCalendarStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.userService.updateCalendarStatus(id, isActive);
  }
  @Post(':id/request-delete')
  async requestDelete(@Param('id') id: string) {
    const result = await this.userService.requestDelete(id);
    return {
      statusCode: 201,
      message: result.message,
      result: result.user, // or any extra data you want
    };
  }

  // Step 2: Verify OTP → deletes user
  // Verify OTP → delete user
  @Post(':id/verify-delete')
  async verifyDelete(@Param('id') id: string, @Body('otp') otp: string) {
    const result = await this.userService.verifyDelete(id, otp);
    return {
      statusCode: 200,
      message: result.message,
      result: result.deleted,
    };
  }


  // DELETE USER
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    return {
      statusCode: 200,
      message: result.message,
      result: result.deleted,
    };
  }
}
