import { BadRequestException, Injectable } from '@nestjs/common';
import { InsProjectExtensions, insProjectExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';

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
