// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   //  CREATE USER WITH IMAGE 
//  @Post()
// @UseInterceptors(FileInterceptor('profileImage'))
// create(
//   @UploadedFile() file: Express.Multer.File,
//   @Body() dto: any
// ) {
//   console.log('File =>', file);
//   console.log('Fieldname =>', file?.fieldname);
//   return this.userService.create(dto, file);
// }

//   //  GET ALL USERS 
//   @Get()
//   findAll() {
//     return this.userService.findAll();
//   }

//   //  GET SINGLE USER 
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.userService.findOne(id);
//   }

//   //  UPDATE USER WITH IMAGE 
//   @Patch(':id')
//   @UseInterceptors(FileInterceptor('profileImage'))
//   update(
//     @Param('id') id: string,
//     @Body() dto: any,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     console.log('file',dto)
//     return this.userService.update(id, dto, file);
//   }

//   // DELETE USER 
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.userService.remove(id);
//   }
// }
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
  constructor(private readonly userService: UserService) {}

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

  // DELETE USER
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
