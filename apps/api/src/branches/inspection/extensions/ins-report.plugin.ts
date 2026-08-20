import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';
import { insReportExtensionsSchema, InsReportExtensions } from '@pulse/validators';

@Injectable()
export class InsReportPlugin implements ExtensionPlugin<InsReportExtensions> {
  readonly industry = 'INSPECTION_SERVICES';

  async validateExtensions(data: unknown): Promise<InsReportExtensions> {
    try {
      return await insReportExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Inspection Services Report Extensions',
        errors: error.errors,
      });
    }
  }
}
