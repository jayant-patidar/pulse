import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';
import { CertificationRecord, CertificationSchema } from './certification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CertificationRecord.name, schema: CertificationSchema },
    ]),
  ],
  controllers: [CertificationsController],
  providers: [CertificationsService],
  exports: [CertificationsService],
})
export class CertificationsModule {}
