import { BadRequestException, Injectable } from '@nestjs/common';
import { InsReportExtensions, insReportExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';

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
