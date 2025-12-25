
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private getImageUrl(file?: Express.Multer.File) {
    if (!file) return null;
    return `http://localhost:4000/uploads/${file.filename}`;
  }

  // CREATE USER
  async create(dto: any, file?: Express.Multer.File): Promise<UserDocument> {
    console.log('Saved file =>', file?.filename);

    const imageUrl = this.getImageUrl(file);

    const createdUser = new this.userModel({
      ...dto,
      ...(imageUrl && { profileImage: imageUrl }),
    });

    return createdUser.save();
  }

  // FIND USER BY GOOGLE ID
  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId });
  }

  // GET ALL USERS
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  // GET SINGLE USER
  async findOne(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // FIND BY EMAIL
  async findByEmailUser(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  // UPDATE USER
  async update(
    id: string,
    dto: any,
    file?: Express.Multer.File,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const updateData: any = { ...dto };
    const imageUrl = this.getImageUrl(file);

    if (imageUrl) {
      updateData.profileImage = imageUrl;
    }

    const user = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // DELETE USER
  async remove(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const deleted = await this.userModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('User not found');

    return { message: 'User deleted successfully', deleted };
  }
}
