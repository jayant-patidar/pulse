import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces/extension-plugin.interface';
import { insEquipmentExtensionsSchema, InsEquipmentExtensions } from '@pulse/validators';

@Injectable()
export class InsEquipmentPlugin implements ExtensionPlugin<InsEquipmentExtensions> {
  readonly industry = 'INSPECTION_SERVICES';

  async validateExtensions(data: unknown): Promise<InsEquipmentExtensions> {
    try {
      return await insEquipmentExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Inspection Services Equipment Extensions',
        errors: error.errors,
      });
    }
  }
}
