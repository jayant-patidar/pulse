import mongoose from 'mongoose';

const uri = 'mongodb+srv://pulse-owner:pulsedbowner@pulse-cluster-1.gshnjre.mongodb.net/pulsedb?appName=pulse-cluster-1';

async function run() {
  console.log('Connecting to MongoDB...', uri);
  await mongoose.connect(uri);
  console.log('Connected.');

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('No DB connection');

    // Find User
    const user = await db.collection('users').findOne({ email: 'jon@snow.com' });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    console.log('Found user:', user._id);

    // Find or Create Organization via Membership
    let membership = await db.collection('memberships').findOne({ userId: user._id.toString() });
    let org;
    
    if (!membership) {
      console.log('Membership not found. Creating organization and membership...');
      
      const orgRes = await db.collection('organizations').insertOne({
        name: 'Snow Farms',
        slug: 'snow-farms',
        industry: 'AGRICULTURE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      org = { _id: orgRes.insertedId, name: 'Snow Farms', industry: 'AGRICULTURE' };
      
      const memRes = await db.collection('memberships').insertOne({
        userId: user._id.toString(),
        organizationId: org._id.toString(),
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      membership = { _id: memRes.insertedId };
    } else {
      console.log('Found membership:', membership._id);
      org = await db.collection('organizations').findOne({ _id: new mongoose.Types.ObjectId(membership.organizationId) });
      if (!org) {
        console.log('Organization not found!');
        process.exit(1);
      }
    }
    
    console.log('Found org:', org.name, org.industry);

    // Create a Project
    const projectRes = await db.collection('projects').insertOne({
      organizationId: org._id.toString(),
      name: 'Winterfell Farm',
      projectCode: 'WF-001',
      industry: 'AGRICULTURE',
      status: 'ACTIVE',
      budget: 50000000,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {},
      location: {
        address: '1 Kingsroad',
        city: 'Winterfell',
        state: 'North',
        zip: '00001'
      }
    });
    const projectId = projectRes.insertedId.toString();
    console.log('Created project:', projectId);

    // Create Crop Cycles
    await db.collection('crop_cycles').insertMany([
      {
        projectId,
        cropType: 'Winter Wheat',
        fieldLocation: 'North 40',
        expectedYield: 5000,
        status: 'IN_PROGRESS',
        startDate: new Date('2026-04-01'),
        harvestDate: new Date('2026-10-15'),
        stages: [
          { name: 'Planting', status: 'COMPLETED', date: new Date('2026-04-01') },
          { name: 'Tillering', status: 'IN_PROGRESS', date: new Date('2026-05-15') },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        projectId,
        cropType: 'Soybeans',
        fieldLocation: 'South 80',
        expectedYield: 3000,
        status: 'PLANNED',
        startDate: new Date('2027-05-01'),
        harvestDate: new Date('2027-09-30'),
        stages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log('Created crop cycles');

    // Create Scouting Reports
    await db.collection('scouting_reports').insertMany([
      {
        projectId,
        cropCycleId: null,
        inspectorId: user._id.toString(),
        fieldLocation: 'North 40 - Zone A',
        threatType: 'PEST',
        threatLevel: 'HIGH',
        notes: 'Aphid infestation spotted near the tree line.',
        images: [],
        status: 'OPEN',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
      },
      {
        projectId,
        cropCycleId: null,
        inspectorId: user._id.toString(),
        fieldLocation: 'South 80',
        threatType: 'DISEASE',
        threatLevel: 'LOW',
        notes: 'Minor signs of rust on leaves, monitor closely.',
        images: [],
        status: 'OPEN',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }
    ]);
    console.log('Created scouting reports');

    // Create Harvest Logs
    await db.collection('harvest_logs').insertMany([
      {
        projectId,
        cropCycleId: null,
        supervisorId: user._id.toString(),
        fieldLocation: 'West 120',
        yieldAmount: 8500,
        yieldUnit: 'bushels',
        moistureContent: 13.5,
        qualityGrade: 'Grade 1',
        date: new Date('2025-10-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        projectId,
        cropCycleId: null,
        supervisorId: user._id.toString(),
        fieldLocation: 'East 60',
        yieldAmount: 4200,
        yieldUnit: 'bushels',
        moistureContent: 14.1,
        qualityGrade: 'Grade 2',
        date: new Date('2025-10-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log('Created harvest logs');

    // Create Compliance Records
    await db.collection('compliance_records').insertMany([
      {
        projectId,
        recordType: 'CHEMICAL_APPLICATION',
        status: 'ACTIVE',
        details: {
          chemical: 'Glyphosate 41%',
          epaRegistration: '524-475',
          applicatorName: 'Jon Snow',
          rate: '32 oz/acre',
          field: 'North 40'
        },
        issueDate: new Date('2026-05-20'),
        expiryDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        projectId,
        recordType: 'CERTIFICATION',
        status: 'ACTIVE',
        details: {
          name: 'USDA Organic Certification',
          certifyingBody: 'USDA'
        },
        issueDate: new Date('2025-01-01'),
        expiryDate: new Date('2027-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
    console.log('Created compliance records');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
