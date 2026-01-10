
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

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

  async updateCalendarStatus(
    userId: string,
    isActive: boolean,
  ): Promise<UserDocument> {

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        isGoogleCalendarActive: isActive,
        ...(isActive && { googleCalendarConnectedAt: new Date() }),
      },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }


  // DELETE USER
  // async remove(id: string): Promise<any> {
  //   if (!Types.ObjectId.isValid(id)) {
  //     throw new BadRequestException('Invalid user ID');
  //   }

  //   const deleted = await this.userModel.findByIdAndDelete(id);

  //   if (!deleted) throw new NotFoundException('User not found');

  //   return { message: 'User deleted successfully', deleted };
  // }
  async requestDelete(userId: string): Promise<{
    user: any; message: string 
}> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await this.sendOtpEmail(user.email, otp);
    const { password, otp: _, otpExpires: __, ...userData } = user.toObject();

    return { message: 'OTP sent to your email' , user:userData };
  }

  // Step 2: Verify OTP → delete user
  async verifyDelete(userId: string, otp: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.otp || user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const deleted = await this.userModel.findByIdAndDelete(userId);

    return { message: 'User deleted successfully', deleted };
  }

  // Send OTP Email (Nodemailer)
  private async sendOtpEmail(email: string, otp: string) {
    // Create transporter using .env values
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"HiveRift" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'OTP for Account Deletion',
      text: `Your OTP to delete your account is ${otp}. It will expire in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    console.log('Message ID:', info.messageId);
  }

  // ====== Existing Immediate Delete (optional) ======
  async remove(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const deleted = await this.userModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('User not found');

    return { message: 'User deleted successfully', deleted };
  }
}
