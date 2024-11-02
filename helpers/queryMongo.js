// const { MongoClient } = require('mongodb');
const { client } = require('../bin/database');
// const uri = "mongodb://localhost:27017/";
// const client = new MongoClient(uri);

module.exports = {
  queryGET: async (database, collection, filter) => {
    return new Promise(async (resolve, reject) => {

      await client.db(database).collection(collection).find( filter, {} ).toArray().then(results => {
        resolve(results)
        // console.log(results)
      })

    });
  },

  queryPOST: async (db, collection, doc) => {
    return new Promise(async (resolve, reject) => {

      // await client.connect();

      await client.db(db).collection(collection).insertOne(doc).then(results => {
        resolve(results)
        console.log(doc)
      })

    });
  },

  queryPUT: async (db, collection, doc) => {
    return new Promise(async (resolve, reject) => {

      // await client.connect();

      await client.db(db).collection(collection).updateOne(doc).then(results => {
        resolve(results)
        console.log(doc)
      })

    });
  },

  // querySoftDELETE: async (db, collection, doc) => {
  //   return new Promise(async (resolve, reject) => {

  //     // await client.connect();

  //     await client.db(db).collection(collection).updateOne(doc).then(results => {
  //       resolve(results)
  //       console.log(doc)
  //     })

  //   });
  // },

  // queryDELETE: async (db, collection, doc) => {
  //   return new Promise(async (resolve, reject) => {

  //     // await client.connect();

  //     await client.db(db).collection(collection).updateOne(doc).then(results => {
  //       resolve(results)
  //       console.log(doc)
  //     })

  //   });
  // },
}