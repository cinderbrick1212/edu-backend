const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();

    // Get cluster info via admin
    const admin = client.db().admin();

    const buildInfo = await admin.serverStatus();
    console.log('Server version:', buildInfo.version);

    const dbs = await admin.listDatabases();
    console.log('\nDatabases:');
    for (const dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name} (sizeOnDisk: ${dbInfo.sizeOnDisk})`);
      const db = client.db(dbInfo.name);
      const cols = await db.listCollections().toArray();
      for (const c of cols) {
        // try to get collection stats
        let stats = {};
        try { stats = await db.collection(c.name).stats(); } catch (e) { /* ignore */ }
        console.log(`   • ${c.name} (docs: ${stats.count ?? 'n/a'}, size: ${stats.size ?? 'n/a'})`);
      }
    }
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
