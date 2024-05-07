import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { SignUpDto } from '../dto/signup.dto';
import { ProducerService } from '../../../libs/common/src/kafka/producer.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly producerService: ProducerService,
    private jwtService: JwtService,
    @InjectModel(User.name) public userModel: Model<User>,
  ) {}

  async getHello(): Promise<string> {
    await this.producerService.produce({
      topic: 'test',
      messages: [{ value: 'Hello Kafka' }],
    });
    return 'Hello World!';
  }

  // signUp method

  async signUp(signUpDto: SignUpDto): Promise<{ user: User; token: string }> {
    const userExists = await this.userModel
      .findOne({ email: signUpDto.email })
      .exec();
    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      address,
      password,
    } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      address,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({
      email: user.email,
      timestamp: new Date(),
    });
    user.Token = token;
    await user.save();

    if (user) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
          user: 'abdulsamea2003@gmail.com',
          pass: 'zmtt vxgh onij luey',
        },
      });
      const mailOptions = {
        from: 'abdulsamea2003@gmail.com',
        to: email,
        subject: 'verify email',
        text: `You are receiving this because you (or someone else) have requested the verification of the email for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
                http://localhost:3000/verify/${token}\n\n
                If you did not request this, please ignore this email and your account will remain inactive.\n`,
      };
      await transporter.sendMail(mailOptions);
    }

    await this.producerService.produce({
      topic: 'signup-user',
      messages: [{ value: JSON.stringify(user) }],
    });

    return { user, token };
  }

  async verifyEmail(token: string): Promise<any> {
    const payload = this.jwtService.verify(token);
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(payload.email)
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.isVerified = true;
    await user.save();
    return { message: 'Email verified successfully' };
  }

  // validateToken method
  async validateToken(token: string): Promise<User> {
    return this.jwtService.verify(token, {
      secret: 'secret',
    });
  }

  // login method
  async login(loginDto: any): Promise<{ user: User }> {
    const { email, password } = loginDto;
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(email)
      .exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    // const token = this.jwtService.sign({ email: user.email });

    await this.producerService.produce({
      topic: 'login-user',
      messages: [{ value: JSON.stringify(user) }],
    });
    return { user };
  }

  // sendForgotPassword method
  async sendForgotPassword(email: string): Promise<any> {
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(email)
      .exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordResetToken = this.jwtService.sign({ email: user.email });

    const updatedUser = await this.userModel
      .findOneAndUpdate({ email }, { passwordResetToken }, { new: true })
      .exec();
    if (updatedUser) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
          user: 'abdulsamea2003@gmail.com',
          pass: 'zmtt vxgh onij luey',
        },
      });

      const mailOptions = {
        from: 'abdulsamea2003@gmail.com',
        to: email,
        subject: 'Reset Password',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://localhost:3000/reset/${passwordResetToken}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      return await transporter.sendMail(mailOptions);
    }
  }

  // resetPassword method
  async resetPassword(token: string, password: string): Promise<any> {
    const { email } = this.jwtService.verify(token);
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(email)
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email: user.email }, { password: hashedPassword })
      .exec();
    if (updatedUser) {
      return { message: 'Password reset successfully' };
    }
  }
}
