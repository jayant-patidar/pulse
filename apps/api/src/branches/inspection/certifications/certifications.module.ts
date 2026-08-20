import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CertificationRecord, CertificationSchema } from './certification.schema';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';

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
