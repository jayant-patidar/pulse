import { BadRequestException, Injectable } from '@nestjs/common';
import { AgrProjectExtensions, agrProjectExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

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
