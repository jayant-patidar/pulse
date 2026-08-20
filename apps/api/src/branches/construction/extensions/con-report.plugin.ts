import { BadRequestException, Injectable } from '@nestjs/common';
import { ConReportExtensions, conReportExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

@Injectable()
export class ConReportPlugin implements ExtensionPlugin<ConReportExtensions> {
  readonly industry = 'CONSTRUCTION';

  async validateExtensions(data: unknown): Promise<ConReportExtensions> {
    try {
      return await conReportExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Construction Report Extensions',
        errors: error.errors,
      });
    }
  }
}
