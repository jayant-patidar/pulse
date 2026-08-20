// ============================================================
// Pulse API — Root Application Module
// ============================================================
// Wires together all three Tree Architecture layers:
//   Root  → Auth, Organizations, Users, Memberships, RBAC, Audit
//   Trunk → Projects, Tasks, DailyReports, Documents, Equipment
//   Branch → Construction (Safety, ChangeOrders, POs, COI)
// ============================================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

// ---- ROOT MODULES ----
import { AuditModule } from './root/audit/audit.module';
import { AuthModule } from './root/auth/auth.module';
import { MembershipsModule } from './root/memberships/memberships.module';
import { OrganizationsModule } from './root/organizations/organizations.module';
import { RbacModule } from './root/rbac/rbac.module';
import { UsersModule } from './root/users/users.module';

import { BullModule } from '@nestjs/bull';
import { NotificationsModule } from './root/notifications/notifications.module';
import { RealtimeModule } from './root/realtime/realtime.module';
import { SearchModule } from './root/search/search.module';

import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './root/reminders/reminders.module';

// ---- TRUNK MODULES ----
import { TimesheetsModule } from './branches/construction/timesheets/timesheets.module';
import { DailyReportsModule } from './trunk/daily-reports/daily-reports.module';
import { DocumentsModule } from './trunk/documents/documents.module';
import { EquipmentModule } from './trunk/equipment/equipment.module';
import { ProjectsModule } from './trunk/projects/projects.module';
import { TasksModule } from './trunk/tasks/tasks.module';

// ---- BRANCH MODULES ----
import { AgricultureModule } from './branches/agriculture/agriculture.module';
import { ConstructionModule } from './branches/construction/construction.module';
import { InspectionModule } from './branches/inspection/inspection.module';

@Module({
  imports: [
    // ---- INFRASTRUCTURE ----
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/pulse?replicaSet=rs0'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
      }),
      inject: [ConfigService],
    }),

    // ---- ROOT LAYER ----
    AuthModule,
    OrganizationsModule,
    UsersModule,
    MembershipsModule,
    RbacModule,
    AuditModule,
    NotificationsModule,
    RealtimeModule,
    SearchModule,
    RemindersModule,
    TimesheetsModule,

    // ---- TRUNK LAYER ----
    ProjectsModule,
    TasksModule,
    DailyReportsModule,
    DocumentsModule,
    EquipmentModule,

    // ---- BRANCH LAYER ----
    // Adding a new industry = adding ONE line here + the branch module files.
    ConstructionModule,
    AgricultureModule,
    InspectionModule,
  ],
})
export class AppModule {}
