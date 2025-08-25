import {
  Controller,
  Post,
  Param,
  ParseEnumPipe,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './providers/documents.service';
import { DocumentType } from './enums/enums';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';

const MAX = Number(process.env.MAX_FILE_MB || 12) * 1024 * 1024;

@Controller('applications/documents')
@UseGuards(AccessTokenGuard as any)
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Post('upload/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX },
      fileFilter: (_req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(
          file.mimetype,
        );
        cb(ok ? null : new Error('Unsupported mime'), ok);
      },
    }),
  )
  upload(
    @Req() req: any,
    @Param('type', new ParseEnumPipe(DocumentType)) type: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.upload(req.user.sub, type, file);
  }

  @Post('replace/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX },
      fileFilter: (_req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(
          file.mimetype,
        );
        cb(ok ? null : new Error('Unsupported mime'), ok);
      },
    }),
  )
  replace(
    @Req() req: any,
    @Param('type', new ParseEnumPipe(DocumentType)) type: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.replace(req.user.sub, type, file);
  }

  @Get()
  list(@Req() req: any) {
    return this.svc.list(req.user.sub);
  }

  @Get('latest/:type')
  latest(
    @Req() req: any,
    @Param('type', new ParseEnumPipe(DocumentType)) type: DocumentType,
  ) {
    return this.svc.latestByType(req.user.sub, type);
  }

  @Delete(':docId')
  remove(@Req() req: any, @Param('docId') docId: string) {
    return this.svc.deleteById(req.user.sub, docId);
  }
}
