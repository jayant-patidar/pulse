import mongoose from 'mongoose';

const uri = 'mongodb+srv://pulse-owner:pulsedbowner@pulse-cluster-1.gshnjre.mongodb.net/pulsedb?appName=pulse-cluster-1';

async function run() {
  console.log('Connecting to MongoDB...', uri);
  await mongoose.connect(uri);
  console.log('Connected.');

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('No DB connection');

    const user = await db.collection('users').findOne({ email: 'jon@snow.com' });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    // Find organization using membership
    const membership = await db.collection('memberships').findOne({ userId: user._id.toString() });
    const orgId = typeof membership?.organizationId === 'string' ? new mongoose.Types.ObjectId(membership.organizationId) : membership?.organizationId;
    
    if (!orgId) {
      console.log('Org ID not found');
      process.exit(1);
    }

    // Fix projects
    const result = await db.collection('projects').updateMany(
      { organizationId: orgId.toString() },
      { $set: { organizationId: orgId, createdBy: user._id, deletedAt: null } }
    );
    console.log(`Updated ${result.modifiedCount} projects to use ObjectId`);

    const projects = await db.collection('projects').find({ organizationId: orgId }).toArray();
    for (const project of projects) {
        const projectIdStr = project._id.toString();
        
        // Fix crop cycles
        await db.collection('crop_cycles').updateMany(
          { projectId: projectIdStr },
          { $set: { projectId: project._id } }
        );

        // Fix scouting reports
        await db.collection('scouting_reports').updateMany(
          { projectId: projectIdStr },
          { $set: { projectId: project._id } }
        );

        // Fix harvest logs
        await db.collection('harvest_logs').updateMany(
          { projectId: projectIdStr },
          { $set: { projectId: project._id } }
        );

        // Fix compliance records
        await db.collection('compliance_records').updateMany(
          { projectId: projectIdStr },
          { $set: { projectId: project._id } }
        );
    }
    console.log('Updated related records to use ObjectId');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
