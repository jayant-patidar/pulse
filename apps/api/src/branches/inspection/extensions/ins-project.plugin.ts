import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';
import { insProjectExtensionsSchema, InsProjectExtensions } from '@pulse/validators';

@Injectable()
export class InsProjectPlugin implements ExtensionPlugin<InsProjectExtensions> {
  readonly industry = 'INSPECTION_SERVICES';

  async validateExtensions(data: unknown): Promise<InsProjectExtensions> {
    try {
      return await insProjectExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Inspection Services Project Extensions',
        errors: error.errors,
      });
    }
  }
}
