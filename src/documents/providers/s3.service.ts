import { Injectable } from '@nestjs/common';
// Install: npm i @aws-sdk/client-s3
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly client = new S3Client({
    region: process.env.AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }
        : undefined,
  });
  private readonly bucket = process.env.S3_BUCKET!;
  private readonly cdnDomain =
    process.env.CLOUDFRONT_DOMAIN ||
    `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  async uploadBuffer(key: string, buffer: Buffer, mime: string, size: number) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        ContentLength: size,
        ACL: 'private',
      }),
    );
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  toCdnUrl(key: string) {
    return `${this.cdnDomain}/${key}`;
  }
}
