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
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

// ---- ROOT MODULES ----
import { AuthModule } from './root/auth/auth.module';
import { OrganizationsModule } from './root/organizations/organizations.module';
import { UsersModule } from './root/users/users.module';
import { MembershipsModule } from './root/memberships/memberships.module';
import { RbacModule } from './root/rbac/rbac.module';
import { AuditModule } from './root/audit/audit.module';

import { NotificationsModule } from './root/notifications/notifications.module';
import { RealtimeModule } from './root/realtime/realtime.module';
import { SearchModule } from './root/search/search.module';
import { BullModule } from '@nestjs/bull';

import { RemindersModule } from './root/reminders/reminders.module';
import { ScheduleModule } from '@nestjs/schedule';

// ---- TRUNK MODULES ----
import { ProjectsModule } from './trunk/projects/projects.module';
import { TasksModule } from './trunk/tasks/tasks.module';
import { DailyReportsModule } from './trunk/daily-reports/daily-reports.module';
import { DocumentsModule } from './trunk/documents/documents.module';
import { EquipmentModule } from './trunk/equipment/equipment.module';
import { TimesheetsModule } from './branches/construction/timesheets/timesheets.module';

// ---- BRANCH MODULES ----
import { ConstructionModule } from './branches/construction/construction.module';

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
  ],
})
export class AppModule {}
