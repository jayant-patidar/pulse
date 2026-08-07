import { Module } from '@nestjs/common';

// ============================================================
// Construction Branch Module
// ============================================================
// This is the FIRST branch. It registers extension plugins
// with Trunk services at bootstrap time.
// See: Doc 04 §4.2
//
// Phase 3 buildout will add:
//   - Safety incidents module
//   - Change orders module
//   - Purchase orders module
//   - COI module
//   - Extension plugins (con-project, con-task, etc.)
// ============================================================
@Module({})
export class ConstructionModule {}
