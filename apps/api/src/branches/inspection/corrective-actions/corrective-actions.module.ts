import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorrectiveActionRecord, CorrectiveActionSchema } from './corrective-action.schema';
import { CorrectiveActionsController } from './corrective-actions.controller';
import { CorrectiveActionsService } from './corrective-actions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CorrectiveActionRecord.name, schema: CorrectiveActionSchema },
    ]),
  ],
  controllers: [CorrectiveActionsController],
  providers: [CorrectiveActionsService],
  exports: [CorrectiveActionsService],
})
export class CorrectiveActionsModule {}
