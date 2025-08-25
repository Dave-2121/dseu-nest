import { forwardRef, Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './providers/documents.service';
import { S3Service } from './providers/s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantDocument } from './applicant-document.entity';
import { ApplicantProfile } from 'src/applicant-profile/entities/applicant-profile.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
  imports: [
    TypeOrmModule.forFeature([ApplicantDocument, ApplicantProfile]),
    forwardRef(() => ApplicantProfile),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    AuthModule,
  ],
})
export class DocumentsModule {}
