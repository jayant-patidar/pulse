import { Module, OnApplicationBootstrap } from '@nestjs/common';

// Sub-modules
import { ComplianceModule } from './compliance/compliance.module';
import { CropCyclesModule } from './crop-cycles/crop-cycles.module';
import { HarvestsModule } from './harvests/harvests.module';
import { InputsModule } from './inputs/inputs.module';
import { ScoutingModule } from './scouting/scouting.module';

// Trunk Modules to access Registries
import { DailyReportsModule } from '../../trunk/daily-reports/daily-reports.module';
import { EquipmentModule } from '../../trunk/equipment/equipment.module';
import { ProjectsModule } from '../../trunk/projects/projects.module';
import { TasksModule } from '../../trunk/tasks/tasks.module';

// Trunk Registries
import { ReportExtensionRegistry } from '../../trunk/daily-reports/daily-reports.registry';
import { EquipmentExtensionRegistry } from '../../trunk/equipment/equipment.registry';
import { ProjectExtensionRegistry } from '../../trunk/projects/projects.registry';
import { TaskExtensionRegistry } from '../../trunk/tasks/tasks.registry';

// Plugins
import { AgrEquipmentPlugin } from './extensions/agr-equipment.plugin';
import { AgrProjectPlugin } from './extensions/agr-project.plugin';
import { AgrReportPlugin } from './extensions/agr-report.plugin';
import { AgrTaskPlugin } from './extensions/agr-task.plugin';

@Module({
  imports: [
    CropCyclesModule,
    ScoutingModule,
    HarvestsModule,
    InputsModule,
    ComplianceModule,
    ProjectsModule,
    TasksModule,
    DailyReportsModule,
    EquipmentModule,
  ],
  providers: [
    AgrProjectPlugin,
    AgrTaskPlugin,
    AgrReportPlugin,
    AgrEquipmentPlugin,
  ],
})
export class AgricultureModule implements OnApplicationBootstrap {
  constructor(
    private readonly projectRegistry: ProjectExtensionRegistry,
    private readonly taskRegistry: TaskExtensionRegistry,
    private readonly reportRegistry: ReportExtensionRegistry,
    private readonly equipmentRegistry: EquipmentExtensionRegistry,
    
    private readonly agrProjectPlugin: AgrProjectPlugin,
    private readonly agrTaskPlugin: AgrTaskPlugin,
    private readonly agrReportPlugin: AgrReportPlugin,
    private readonly agrEquipmentPlugin: AgrEquipmentPlugin,
  ) {}

  onApplicationBootstrap() {
    this.projectRegistry.register(this.agrProjectPlugin);
    this.taskRegistry.register(this.agrTaskPlugin);
    this.reportRegistry.register(this.agrReportPlugin);
    this.equipmentRegistry.register(this.agrEquipmentPlugin);
  }
}
