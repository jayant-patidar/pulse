import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';

async function bootstrap() {
  console.log('Starting DB Seed...');
  
  // We need to set the environment to avoid conflicts, or rely on defaults
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

    console.log('Clearing existing data...');
    await OrganizationModel.deleteMany({});
    await UserModel.deleteMany({});
    await MembershipModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await TaskModel.deleteMany({});
    await ReportModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await EquipmentModel.deleteMany({});
    await SafetyModel.deleteMany({});
    await COIModel.deleteMany({});
    await ChangeOrderModel.deleteMany({});
    await PurchaseOrderModel.deleteMany({});

    console.log('Creating Organization...');
    const org = await OrganizationModel.create({
      name: 'BuildCo Inc.',
      slug: 'buildco-inc',
      industry: 'CONSTRUCTION',
      settings: { timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY' }
    });

    console.log('Creating User...');
    const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });
    const user = await UserModel.create({
      email: 'admin@buildco.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
    });

    await MembershipModel.create({
      userId: user._id,
      organizationId: org._id,
      role: 'OWNER',
      status: 'ACTIVE'
    });

    console.log('Creating Trunk Entities...');
    const commonFields = { createdBy: user._id, industry: 'CONSTRUCTION' };

    // Projects
    const project1 = await ProjectModel.create({
      organizationId: org._id,
      ...commonFields,
      name: 'Downtown Commercial High-Rise',
      projectCode: 'DT-001',
      status: 'ACTIVE',
      address: '100 Main St, Cityville',
      description: 'A 40-story commercial office building.',
      extensions: {
        buildingType: 'COMMERCIAL',
        permitNumber: 'BLD-2026-9912'
      }
    });

    const project2 = await ProjectModel.create({
      organizationId: org._id,
      ...commonFields,
      name: 'Riverside Residential Complex',
      projectCode: 'RS-002',
      status: 'DRAFT',
      address: '500 River Rd, Townsville',
      extensions: {
        buildingType: 'RESIDENTIAL',
        permitNumber: 'BLD-2026-9913'
      }
    });

    // Tasks
    await TaskModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      title: 'Excavation Phase 1',
      description: 'Complete the main foundation excavation.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      extensions: {
        taskType: 'MILESTONE'
      }
    });
    
    await TaskModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      title: 'Clarification on Rebar Specs',
      description: 'Need clarification from structural engineer on grade 60 vs 75 rebar.',
      status: 'TODO',
      priority: 'URGENT',
      extensions: {
        taskType: 'RFI',
        rfiNumber: 'RFI-001',
        specSection: '03-20-00',
        drawingReference: 'S-101'
      }
    });

    // Reports
    await ReportModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      date: new Date(),
      weather: {
        temperature: 72,
        conditions: 'Sunny',
        precipitation: 0
      },
      notes: 'Good progress on the foundation today.',
      extensions: {
        concretePouredVolumeYd3: 150,
        craneHours: 6
      }
    });

    // Documents
    await DocumentModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      name: 'Foundation Plans v2',
      title: 'Foundation Plans v2',
      category: 'PLANS',
      status: 'APPROVED',
      url: 'https://pulse.dev/fake-file.pdf',
      version: 2,
      sizeBytes: 2500000, // 2.5 MB
      fileType: 'application/pdf',
      originalFilename: 'foundation_v2.pdf'
    });

    // Equipment
    await EquipmentModel.create({
      organizationId: org._id,
      ...commonFields,
      name: 'Tower Crane A',
      status: 'IN_USE',
      lastMaintenanceDate: new Date(),
      extensions: {
        equipmentClass: 'CRANE',
        loadCapacity: '20 Tons'
      }
    });

    console.log('Creating Construction Entities (Branch)...');
    
    // Safety
    await SafetyModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      incidentType: 'INJURY',
      severity: 'MEDIUM',
      dateOccurred: new Date(),
      description: 'Worker tripped over exposed rebar.',
      status: 'OPEN',
      oshaRecordable: true,
      reportedBy: user._id
    });

    // Change Order
    await ChangeOrderModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      coNumber: 'CO-001',
      title: 'Upgraded Lobby Finishes',
      reasonCode: 'OWNER_REQUEST',
      costImpactCents: 4500000, // $45,000
      scheduleImpactDays: 5,
      status: 'UNDER_REVIEW',
      requestedBy: user._id,
      lineItems: [
        { description: 'Marble Flooring', quantity: 1000, unitPriceCents: 4500, totalCents: 4500000 }
      ]
    });

    // Purchase Order
    await PurchaseOrderModel.create({
      organizationId: org._id,
      ...commonFields,
      projectId: project1._id,
      poNumber: 'PO-1001',
      supplierName: 'Acme Steel Co.',
      status: 'ISSUED',
      totalAmountCents: 1250000, // $12,500
      deliveryDateExpected: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      issuedBy: user._id,
      lineItems: [
        { materialDescription: 'Grade 60 Rebar', quantity: 10, unitOfMeasure: 'TON', unitPriceCents: 125000, totalCents: 1250000, quantityReceived: 0 }
      ]
    });

    // COI
    await COIModel.create({
      organizationId: org._id,
      ...commonFields,
      subcontractorName: 'Electric Corp',
      policyType: 'GENERAL_LIABILITY',
      carrierName: 'Travelers Insurance',
      policyNumber: 'GL-998877',
      status: 'COMPLIANT',
      effectiveDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    });

    console.log('====================================');
    console.log('✅ DB SEEDING COMPLETE');
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
