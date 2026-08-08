import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';

async function bootstrap() {
  console.log('Starting Safe DB Seed (Upsert)...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const OrganizationModel = app.get<Model<any>>(getModelToken('OrganizationDocument'));
    const UserModel = app.get<Model<any>>(getModelToken('UserDocument'));
    const MembershipModel = app.get<Model<any>>(getModelToken('MembershipDocument'));
    const ProjectModel = app.get<Model<any>>(getModelToken('ProjectDocument'));
    const TaskModel = app.get<Model<any>>(getModelToken('TaskDocument'));
    const ReportModel = app.get<Model<any>>(getModelToken('DailyReportDocument'));
    const DocumentModel = app.get<Model<any>>(getModelToken('DocumentRecord'));
    const EquipmentModel = app.get<Model<any>>(getModelToken('EquipmentDocument'));
    
    const SafetyModel = app.get<Model<any>>(getModelToken('SafetyIncidentRecord'));
    const COIModel = app.get<Model<any>>(getModelToken('CoiRecord'));
    const ChangeOrderModel = app.get<Model<any>>(getModelToken('ChangeOrderRecord'));
    const PurchaseOrderModel = app.get<Model<any>>(getModelToken('PurchaseOrderRecord'));

    console.log('Creating/Updating Organization...');
    const org = await OrganizationModel.findOneAndUpdate(
      { slug: 'buildco-inc' },
      {
        $set: {
          name: 'BuildCo Inc.',
          industry: 'CONSTRUCTION',
          settings: { timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY' }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Creating/Updating User...');
    const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });
    const user = await UserModel.findOneAndUpdate(
      { email: 'admin@buildco.com' },
      {
        $set: {
          passwordHash,
          firstName: 'Admin',
          lastName: 'User',
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await MembershipModel.findOneAndUpdate(
      { userId: user._id, organizationId: org._id },
      {
        $set: {
          role: 'OWNER',
          status: 'ACTIVE'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Creating/Updating Trunk Entities...');
    const commonFields = { createdBy: user._id, industry: 'CONSTRUCTION' };

    // Projects
    const project1 = await ProjectModel.findOneAndUpdate(
      { name: 'Downtown Commercial High-Rise' },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          status: 'ACTIVE',
          address: '100 Main St, Cityville',
          description: 'A 40-story commercial office building.',
          extensions: {
            buildingType: 'COMMERCIAL',
            permitNumber: 'BLD-2026-9912'
          }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ProjectModel.findOneAndUpdate(
      { name: 'Riverside Residential Complex' },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          status: 'DRAFT',
          address: '500 River Rd, Townsville',
          extensions: {
            buildingType: 'RESIDENTIAL',
            permitNumber: 'BLD-2026-9913'
          }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Tasks
    await TaskModel.findOneAndUpdate(
      { title: 'Excavation Phase 1', projectId: project1._id },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          description: 'Complete the main foundation excavation.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          extensions: { taskType: 'MILESTONE' }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // OVERDUE TASK FOR REMINDERS
    await TaskModel.findOneAndUpdate(
      { title: 'Clarification on Rebar Specs', projectId: project1._id },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          description: 'Need clarification from structural engineer on grade 60 vs 75 rebar.',
          status: 'TODO',
          priority: 'URGENT',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 Days Overdue
          extensions: {
            taskType: 'RFI',
            rfiNumber: 'RFI-001',
            specSection: '03-20-00',
            drawingReference: 'S-101'
          }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // DUE TODAY TASK FOR REMINDERS
    await TaskModel.findOneAndUpdate(
      { title: 'Sign Safety Waiver', projectId: project1._id },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          description: 'All subs must sign safety waiver.',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date(), // Due Today
          extensions: { taskType: 'GENERAL' }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Reports
    await ReportModel.findOneAndUpdate(
      { projectId: project1._id, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } },
      {
        $set: {
          organizationId: org._id,
          ...commonFields,
          weather: { temperature: 72, conditions: 'Sunny', precipitation: 0 },
          notes: 'Good progress on the foundation today.',
          extensions: { concretePouredVolumeYd3: 150, craneHours: 6 }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('====================================');
    console.log('✅ DB SEEDING (UPSERT) COMPLETE');
    console.log(`Login Email: admin@buildco.com`);
    console.log(`Password:    password123`);
    console.log('====================================');
    
  } catch (error) {
    console.error('Seeding Failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
