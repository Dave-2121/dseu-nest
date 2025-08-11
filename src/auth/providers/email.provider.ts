import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailConfigService } from 'src/config/mail.config';

@Injectable()
export class EmailProvider {
  constructor(private readonly mailConfigService: MailConfigService) {}
  private async createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.mailConfigService.mailUser,
        pass: this.mailConfigService.mailPass,
      },
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    subject: string = `Your OTP for Registration`,
  ) {
    const transporter = await this.createTransporter();

    const mailOptions = {
      from: this.mailConfigService.mailUser,
      to: email,
      subject: `Your OTP for ${subject}`,
      text: `Your OTP is ${otp}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new HttpException(
        `Failed to send OTP email: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
