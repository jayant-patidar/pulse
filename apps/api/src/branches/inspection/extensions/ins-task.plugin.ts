import { BadRequestException, Injectable } from '@nestjs/common';
import { InsTaskExtensions, insTaskExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';

@Injectable()
export class InsTaskPlugin implements ExtensionPlugin<InsTaskExtensions> {
  readonly industry = 'INSPECTION_SERVICES';

  async validateExtensions(data: unknown): Promise<InsTaskExtensions> {
    try {
      return await insTaskExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Inspection Services Task Extensions',
        errors: error.errors,
      });
    }
  }
}
