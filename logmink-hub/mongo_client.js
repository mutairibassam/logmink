const mongoose = require("mongoose");

class Mongoosedb {
    static async connect() {
        if (this.db) return this.db;
        let mongo_client = await mongoose.connect(process.env.mongoUrl || this.url, this.options);
        this.client = mongo_client;
        this.db = mongo_client.db;
        return this.db;
    }

    static async close() {
        mongoose.connection.close(true);
    }
}

Mongoosedb.client = null;
Mongoosedb.db = null;
// Mongoosedb.url = 'mongodb://localhost:27017/logdb-dev';
// Mongoosedb.options = {
//     // poolSize:   10,
//     // reconnectTries:     5000,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// };

module.exports = Mongoosedb;