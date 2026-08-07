import { Module } from '@nestjs/common';
import { SafetyModule } from './safety/safety.module';
import { ChangeOrdersModule } from './change-orders/change-orders.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CoiModule } from './coi/coi.module';

// ============================================================
// Construction Branch Module
// ============================================================
// This is the FIRST branch. It registers extension plugins
// with Trunk services at bootstrap time.
// See: Doc 04 §4.2
//
// Phase 3 buildout adds:
//   - Safety incidents module
//   - Change orders module
//   - Purchase orders module
//   - COI module
//   - Extension plugins (con-project, con-task, etc.)
// ============================================================
@Module({
  imports: [
    SafetyModule,
    ChangeOrdersModule,
    PurchaseOrdersModule,
    CoiModule,
  ],
})
export class ConstructionModule {}
