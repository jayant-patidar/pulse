import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentRecord } from '../../trunk/documents/documents.schema';
import { EquipmentDocument } from '../../trunk/equipment/equipment.schema';
import { ProjectDocument } from '../../trunk/projects/projects.schema';
import { TaskDocument } from '../../trunk/tasks/tasks.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(ProjectDocument.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(TaskDocument.name) private taskModel: Model<TaskDocument>,
    @InjectModel(DocumentRecord.name) private documentModel: Model<DocumentRecord>,
    @InjectModel(EquipmentDocument.name) private equipmentModel: Model<EquipmentDocument>,
  ) {}

  async globalSearch(query: string, organizationId: string) {
    if (!query || query.trim() === '') {
      return { projects: [], tasks: [], documents: [], equipment: [] };
    }

    const regex = new RegExp(query, 'i');

    const [projects, tasks, documents, equipment] = await Promise.all([
      this.projectModel
        .find({ organizationId, $or: [{ name: regex }, { client: regex }] })
        .limit(5)
        .exec(),
      this.taskModel
        .find({ organizationId, $or: [{ title: regex }, { description: regex }] })
        .limit(5)
        .exec(),
      this.documentModel
        .find({ organizationId, $or: [{ name: regex }] })
        .limit(5)
        .exec(),
      this.equipmentModel
        .find({ organizationId, $or: [{ name: regex }, { model: regex }] })
        .limit(5)
        .exec(),
    ]);

    return { projects, tasks, documents, equipment };
  }
}
