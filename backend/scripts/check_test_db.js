const mongoose = require('mongoose');

async function checkData() {
    try {
        const client = await mongoose.connect('mongodb://127.0.0.1:27017/test');

        console.log('Database: test');
        const collections = await client.connection.db.listCollections().toArray();
        for (const col of collections) {
            const count = await client.connection.db.collection(col.name).countDocuments();
            console.log(`  - ${col.name}: ${count}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkData();
