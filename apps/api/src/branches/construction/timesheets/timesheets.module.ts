import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsModule } from '../../../root/memberships/memberships.module';
import { RbacModule } from '../../../root/rbac/rbac.module';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetDocument, TimesheetSchema } from './timesheets.schema';
import { TimesheetsService } from './timesheets.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimesheetDocument.name, schema: TimesheetSchema }]),
    MembershipsModule,
    RbacModule,
  ],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
