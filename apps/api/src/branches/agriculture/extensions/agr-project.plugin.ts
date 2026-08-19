import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces';
import { agrProjectExtensionsSchema, AgrProjectExtensions } from '@pulse/validators';

@Injectable()
export class AgrProjectPlugin implements ExtensionPlugin<AgrProjectExtensions> {
  readonly industry = 'AGRICULTURE';

  async validateExtensions(data: unknown): Promise<AgrProjectExtensions> {
    try {
      return await agrProjectExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Agriculture Project Extensions',
        errors: error.errors,
      });
    }
  }
}
