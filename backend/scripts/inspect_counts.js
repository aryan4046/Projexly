const mongoose = require('mongoose');

async function checkData() {
    try {
        const client = await mongoose.connect('mongodb://127.0.0.1:27017');

        for (const dbName of ['Projexly', 'projectDB']) {
            const db = client.connection.useDb(dbName);
            console.log(`Database: ${dbName}`);
            const collections = ['users', 'projects', 'gigs'];
            for (const col of collections) {
                try {
                    const count = await db.collection(col).countDocuments();
                    console.log(`  - ${col}: ${count}`);
                } catch (e) {
                    console.log(`  - ${col}: 0 (error or empty)`);
                }
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
