const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
        const client = await mongoose.connect(uri);
        const admin = new mongoose.mongo.Admin(client.connection.db);
        const dbs = await admin.listDatabases();

        console.log('--- AVAILABLE DATABASES ---');
        for (const dbInfo of dbs.databases) {
            console.log(`Database: ${dbInfo.name}`);
            const db = client.connection.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  - Collection: ${col.name} (${count} documents)`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
