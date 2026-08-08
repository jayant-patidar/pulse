import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { SafetyModule } from './safety/safety.module';
import { ChangeOrdersModule } from './change-orders/change-orders.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CoiModule } from './coi/coi.module';

// Trunk Modules to access Registries
import { ProjectsModule } from '../../trunk/projects/projects.module';
import { TasksModule } from '../../trunk/tasks/tasks.module';
import { DailyReportsModule } from '../../trunk/daily-reports/daily-reports.module';
import { EquipmentModule } from '../../trunk/equipment/equipment.module';

// Trunk Registries
import { ProjectExtensionRegistry } from '../../trunk/projects/projects.registry';
import { TaskExtensionRegistry } from '../../trunk/tasks/tasks.registry';
import { ReportExtensionRegistry } from '../../trunk/daily-reports/daily-reports.registry';
import { EquipmentExtensionRegistry } from '../../trunk/equipment/equipment.registry';

// Branch Plugins
import { ConProjectPlugin } from './extensions/con-project.plugin';
import { ConTaskPlugin } from './extensions/con-task.plugin';
import { ConReportPlugin } from './extensions/con-report.plugin';
import { ConEquipmentPlugin } from './extensions/con-equipment.plugin';

@Module({
  imports: [
    SafetyModule,
    ChangeOrdersModule,
    PurchaseOrdersModule,
    CoiModule,
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

