import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { HashingProvider } from './providers/hashing.provider';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from './config/jwt.config';
import { EmailProvider } from './providers/email.provider';
import { Otp } from './entities/otp.entity';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailConfigService } from 'src/config/mail.config';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    EmailProvider,
    MailConfigService,
  ],
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
