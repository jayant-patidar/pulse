import { Injectable } from '@nestjs/common';
import { ExtensionRegistry } from '../../common/interfaces';

@Injectable()
export class ProjectExtensionRegistry extends ExtensionRegistry {}
