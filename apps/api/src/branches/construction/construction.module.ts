import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ChangeOrdersModule } from './change-orders/change-orders.module';
import { CoiModule } from './coi/coi.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { SafetyModule } from './safety/safety.module';
import { TimesheetsModule } from './timesheets/timesheets.module';

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

// Branch Plugins
import { ConEquipmentPlugin } from './extensions/con-equipment.plugin';
import { ConProjectPlugin } from './extensions/con-project.plugin';
import { ConReportPlugin } from './extensions/con-report.plugin';
import { ConTaskPlugin } from './extensions/con-task.plugin';

@Module({
  imports: [
    SafetyModule,
    ChangeOrdersModule,
    PurchaseOrdersModule,
    CoiModule,
    TimesheetsModule,
    ProjectsModule,
    TasksModule,
    DailyReportsModule,
    EquipmentModule,
  ],
  providers: [
    ConProjectPlugin,
    ConTaskPlugin,
    ConReportPlugin,
    ConEquipmentPlugin,
  ],
})
export class ConstructionModule implements OnApplicationBootstrap {
  constructor(
    private readonly projectRegistry: ProjectExtensionRegistry,
    private readonly taskRegistry: TaskExtensionRegistry,
    private readonly reportRegistry: ReportExtensionRegistry,
    private readonly equipmentRegistry: EquipmentExtensionRegistry,
    
    private readonly conProjectPlugin: ConProjectPlugin,
    private readonly conTaskPlugin: ConTaskPlugin,
    private readonly conReportPlugin: ConReportPlugin,
    private readonly conEquipmentPlugin: ConEquipmentPlugin,
  ) {}

  onApplicationBootstrap() {
    this.projectRegistry.register(this.conProjectPlugin);
    this.taskRegistry.register(this.conTaskPlugin);
    this.reportRegistry.register(this.conReportPlugin);
    this.equipmentRegistry.register(this.conEquipmentPlugin);
  }
}

