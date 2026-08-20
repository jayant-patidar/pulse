import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ProjectExtensionRegistry } from '../../trunk/projects/projects.registry';
import { TaskExtensionRegistry } from '../../trunk/tasks/tasks.registry';
import { ReportExtensionRegistry } from '../../trunk/daily-reports/daily-reports.registry';
import { EquipmentExtensionRegistry } from '../../trunk/equipment/equipment.registry';

// Inspection Sub-Modules
import { InspectionsModule } from './inspections/inspections.module';
import { FindingsModule } from './findings/findings.module';
import { CertificationsModule } from './certifications/certifications.module';
import { CorrectiveActionsModule } from './corrective-actions/corrective-actions.module';

// Inspection Extension Plugins
import { InsProjectPlugin } from './extensions/ins-project.plugin';
import { InsTaskPlugin } from './extensions/ins-task.plugin';
import { InsReportPlugin } from './extensions/ins-report.plugin';
import { InsEquipmentPlugin } from './extensions/ins-equipment.plugin';

// Trunk Modules to access Registries
import { ProjectsModule } from '../../trunk/projects/projects.module';
import { TasksModule } from '../../trunk/tasks/tasks.module';
import { DailyReportsModule } from '../../trunk/daily-reports/daily-reports.module';
import { EquipmentModule } from '../../trunk/equipment/equipment.module';

@Module({
  imports: [
    ProjectsModule,
    TasksModule,
    DailyReportsModule,
    EquipmentModule,
    InspectionsModule,
    FindingsModule,
    CertificationsModule,
    CorrectiveActionsModule,
  ],
  providers: [
    InsProjectPlugin,
    InsTaskPlugin,
    InsReportPlugin,
    InsEquipmentPlugin,
  ],
  exports: [
    InspectionsModule,
    FindingsModule,
    CertificationsModule,
    CorrectiveActionsModule,
  ],
})
export class InspectionModule implements OnApplicationBootstrap {
  constructor(
    private readonly projectRegistry: ProjectExtensionRegistry,
    private readonly taskRegistry: TaskExtensionRegistry,
    private readonly reportRegistry: ReportExtensionRegistry,
    private readonly equipmentRegistry: EquipmentExtensionRegistry,
    
    private readonly insProjectPlugin: InsProjectPlugin,
    private readonly insTaskPlugin: InsTaskPlugin,
    private readonly insReportPlugin: InsReportPlugin,
    private readonly insEquipmentPlugin: InsEquipmentPlugin,
  ) {}

  onApplicationBootstrap() {
    this.projectRegistry.register(this.insProjectPlugin);
    this.taskRegistry.register(this.insTaskPlugin);
    this.reportRegistry.register(this.insReportPlugin);
    this.equipmentRegistry.register(this.insEquipmentPlugin);
  }
}
