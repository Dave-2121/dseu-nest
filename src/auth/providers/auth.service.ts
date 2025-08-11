import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { SignupDto } from '../dtos/signup.dto';
import { EmailProvider } from './email.provider';
import { LoginDto } from '../dtos/login.dto';
import { UpdateMobileDto } from '../dtos/update-mobile.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,

    private readonly emailProvider: EmailProvider,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateAccessToken(user: User) {
    const jwtConfig = this.configService.get('jwt');
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.accessTokenTtl,
    });
  }

  // Generate Refresh Token
  private generateRefreshToken(user: User) {
    const jwtConfig = this.configService.get('jwt');
    const payload = { username: user.name, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshTokenTtl,
    });
  }

  public async signup(signupDto: SignupDto) {
    const { email, password, confirmPassword } = signupDto;

    if (password !== confirmPassword) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    try {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new HttpException(
          'Email already registered',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Cleanup older OTP records for the same email
      await this.otpRepository.delete({ email });

      const otp = this.generateOTP();
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5); // OTP expires in 5 minutes

      // Save OTP in database
      const otpEntity = this.otpRepository.create({
        email,
        otp,
        expiryTime,
      });

      await this.otpRepository.save(otpEntity);
      await this.emailProvider.sendOtpEmail(email, otp);

      return { message: 'OTP sent to email for verification' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during signup: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during signup',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async verifyOtpAndCreateUser(
    email: string,
    otp: string,
    signupDto: SignupDto,
  ) {
    try {
      const otpRecord = await this.otpRepository.findOne({ where: { email } });
      if (!otpRecord) {
        throw new HttpException(
          'OTP not found or expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (otpRecord.otp !== otp) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }

      const currentTime = new Date();
      if (otpRecord.expiryTime < currentTime) {
        throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
      }

      const { password, name, mobileNo } = signupDto;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        mobileNo,
      });

      await this.userRepository.save(newUser);

      // Clear OTP after successful verification
      await this.otpRepository.delete({ email });

      return { message: 'User created successfully' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during user creation: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during user creation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  public async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.otpRepository.delete({ email });

      const otp = this.generateOTP();
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5);

      const otpEntity = this.otpRepository.create({
        otp,
        email,
        expiryTime,
      });

      await this.otpRepository.save(otpEntity);
      await this.emailProvider.sendOtpEmail(email, otp, 'resetting password');
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during forgot password otp generation: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during forgot password otp generation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return { message: 'OTP sent for password reset' };
  }

  public async resetPassword(email: string, otp: string, newPassword: string) {
    try {
      const otpRecord = await this.otpRepository.findOne({ where: { email } });
      if (!otpRecord) {
        throw new HttpException(
          'OTP not found or expired',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (otpRecord.otp !== otp) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }

      const currentTime = new Date();
      if (otpRecord.expiryTime < currentTime) {
        throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);

      await this.otpRepository.delete({ email });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during reset password: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during reset password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return { message: 'Password reset successfully' };
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { message: 'Login successful', accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during login: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during login',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async updateMobile(userId: string, updateMobileDto: UpdateMobileDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.mobileNo = updateMobileDto.mobileNo;
      await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          `Error occurred during updating mobileNo: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred during updating mobileNo',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return { message: 'Mobile number updated successfully' };
  }
}
