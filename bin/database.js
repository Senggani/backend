const { MongoClient, ObjectId, useNewUrlParser } = require('mongodb');

/* FOR LOCAL DATABASE
const uri = "mongodb://localhost:27017/";
const database = new MongoClient(uri, { useNewUrlParser: true});
const client = database.db("pm_module");

/* FOR ITB DATABASE */
const uri = process.env.MONGODB_URI
const database = new MongoClient(uri, { useNewUrlParser: true });
const client = database.db(process.env.MONGODB_DATABASE);

/* FOR CLOUD DATABASE USING ATLAS
const uri = "mongodb+srv://13220035:3QrGL6zkth7Gmm6k@pm-module.g5lfu.mongodb.net/?retryWrites=true&w=majority&appName=pm-module";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const database = new MongoClient(uri, {
  serverApi: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,  // Enable SSL
    sslValidate: false,
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const client = database.db("pm_module"); */

module.exports = {
  client,
  database,
  ObjectId,

  connectToDatabase: async () => {
    try {
      await database.connect();
      console.log("Success connecting to MongoDB");
    } catch (error) {
      response.failed(res, 'Failed to connect', error)
    }
  },

};