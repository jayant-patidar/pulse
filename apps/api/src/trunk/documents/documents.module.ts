import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentRecord, DocumentSchema } from './documents.schema';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentRecord.name, schema: DocumentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
