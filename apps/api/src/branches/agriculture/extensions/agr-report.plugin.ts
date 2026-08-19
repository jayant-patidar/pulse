import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces';
import { agrReportExtensionsSchema, AgrReportExtensions } from '@pulse/validators';

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
