/* FOR LOCAL DATABASE */
const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb://localhost:27017/";
const database = new MongoClient(uri, { useNewUrlParser: true});
const client = database.db("pm_module");

module.exports = { client, database, ObjectId };

/* FOR ITB DATABASE
const { MongoClient, ObjectId, useNewUrlParser } = require('mongodb');
const uri = "mongodb://preventive_maintenance:hl6GjO5LlRuQT1n@nosql.smartsystem.id:27017/preventive_maintenance"
const database = new MongoClient(uri, { useNewUrlParser: true});
const client = database.db("preventive_maintenance");

module.exports = { client , database , ObjectId }; */

/* FOR CLOUD DATABASE USING ATLAS
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const client = database.db("pm_module");

module.exports = { client , database , ObjectId }; */