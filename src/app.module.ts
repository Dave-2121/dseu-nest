import { ConfigModule, ConfigService } from '@nestjs/config';

// import { APP_GUARD } from '@nestjs/core';
// import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

import { Module } from '@nestjs/common';
import { PaginationModule } from './common/pagination/pagination.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ReferenceModule } from './reference/reference.module';
import { ApplicantProfileModule } from './applicant-profile/applicant-profile.module';
import { ContactsModule } from './contacts/contacts.module';
import { FamilyDetailsModule } from './family-details/family-details.module';
import { BankDetailsModule } from './bank-details/bank-details.module';
import { QuotaDetailsModule } from './quota-details/quota-details.module';
import { OtherDetailsModule } from './other-details/other-details.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
// import enviromentValidation from './config/enviroment.validation';
import jwtConfig from './auth/config/jwt.config';

// Get the current NODE_ENV
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: ['.env.development', '.env'],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      // validationSchema: enviromentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          synchronize: configService.get('database.synchronize'),
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.user'),
          password: process.env.DATABASE_PASSWORD,
          database: configService.get('database.name'),
          autoLoadEntities: configService.get('database.autoLoadEntities'),
        };
      },
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    PaginationModule,
    ReferenceModule,
    ApplicantProfileModule,
    ContactsModule,
    FamilyDetailsModule,
    BankDetailsModule,
    QuotaDetailsModule,
    OtherDetailsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
