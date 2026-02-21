const mongoose = require('mongoose');

async function checkData() {
    try {
        const client = await mongoose.connect('mongodb://127.0.0.1:27017');
        const admin = new mongoose.mongo.Admin(client.connection.db);
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            if (['admin', 'config', 'local'].includes(dbInfo.name)) continue;

            const db = client.connection.useDb(dbInfo.name);
            console.log(`Database: ${dbInfo.name}`);
            const collections = await db.db.listCollections().toArray();
            if (collections.length === 0) {
                console.log('  (No collections)');
            }
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  - ${col.name}: ${count}`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
