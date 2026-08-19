import mongoose from 'mongoose';

const uri = 'mongodb+srv://pulse-owner:pulsedbowner@pulse-cluster-1.gshnjre.mongodb.net/pulsedb?appName=pulse-cluster-1';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const user = await db.collection('users').findOne({ email: 'jon@snow.com' });
  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }

  const memberships = await db.collection('memberships').find({ userId: user._id }).toArray();
  console.log(`User has ${memberships.length} memberships.`);

  // Keep the one associated with Snow Farms
  const snowFarmsOrg = await db.collection('organizations').findOne({ name: 'Snow Farms' });
  if (!snowFarmsOrg) {
    console.log('Snow Farms org not found!');
    process.exit(1);
  }

  for (const m of memberships) {
    if (m.organizationId.toString() !== snowFarmsOrg._id.toString()) {
      console.log('Deleting extra membership:', m._id);
      await db.collection('memberships').deleteOne({ _id: m._id });
    }
  }

  console.log('Finished cleaning up extra memberships.');
  process.exit(0);
}

run();
