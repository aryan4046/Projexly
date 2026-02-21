const mongoose = require('mongoose');

async function checkData() {
    try {
        const client = await mongoose.connect('mongodb://127.0.0.1:27017');
        const admin = new mongoose.mongo.Admin(client.connection.db);
        const dbs = await admin.listDatabases();

        console.log('START_DATA_SCAN');
        for (const dbInfo of dbs.databases) {
            const db = client.connection.useDb(dbInfo.name);
            const collections = await db.db.listCollections().toArray();
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                if (count > 0) {
                    console.log(`FOUND: DB=${dbInfo.name} | Col=${col.name} | Count=${count}`);
                }
            }
        }
        console.log('END_DATA_SCAN');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
