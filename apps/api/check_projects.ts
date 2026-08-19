import mongoose from 'mongoose';

const uri = 'mongodb+srv://pulse-owner:pulsedbowner@pulse-cluster-1.gshnjre.mongodb.net/pulsedb?appName=pulse-cluster-1';

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) process.exit(1);

  const orgs = await db.collection('organizations').find({ name: 'Snow Farms' }).toArray();
  console.log('Orgs:', orgs);
  if(orgs.length) {
    const orgIdStr = orgs[0]._id.toString();
    const orgIdObj = orgs[0]._id;

    console.log('OrgId String:', orgIdStr);
    console.log('OrgId Object:', orgIdObj);

    const projs = await db.collection('projects').find({ organizationId: orgIdObj }).toArray();
    console.log('Projects with ObjectId orgId:', projs);
    const projsStr = await db.collection('projects').find({ organizationId: orgIdStr }).toArray();
    console.log('Projects with String orgId:', projsStr);
  }
  process.exit(0);
}
run();
