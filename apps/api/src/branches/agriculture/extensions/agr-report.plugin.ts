import { BadRequestException, Injectable } from '@nestjs/common';
import { AgrReportExtensions, agrReportExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

@Injectable()
export class AgrReportPlugin implements ExtensionPlugin<AgrReportExtensions> {
  readonly industry = 'AGRICULTURE';

  async validateExtensions(data: unknown): Promise<AgrReportExtensions> {
    try {
      return await agrReportExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Agriculture Report Extensions',
        errors: error.errors,
      });
    }
  }
}
