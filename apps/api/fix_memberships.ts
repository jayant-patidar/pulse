import mongoose from 'mongoose';

const uri = 'mongodb+srv://pulse-owner:pulsedbowner@pulse-cluster-1.gshnjre.mongodb.net/pulsedb?appName=pulse-cluster-1';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const memberships = await db.collection('memberships').find().toArray();
  for (const m of memberships) {
    let update = {};
    if (typeof m.userId === 'string') {
      update.userId = new mongoose.Types.ObjectId(m.userId);
    }
    if (typeof m.organizationId === 'string') {
      update.organizationId = new mongoose.Types.ObjectId(m.organizationId);
    }
    
    if (Object.keys(update).length > 0) {
      await db.collection('memberships').updateOne({ _id: m._id }, { $set: update });
    }
  }

  // Also fix users orgId if it exists
  const users = await db.collection('users').find().toArray();
  for (const u of users) {
    if (typeof u.orgId === 'string') {
      await db.collection('users').updateOne({ _id: u._id }, { $set: { orgId: new mongoose.Types.ObjectId(u.orgId) } });
    }
  }

  console.log('Fixed memberships and users');
  process.exit(0);
}

run();
