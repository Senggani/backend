// const { MongoClient } = require('mongodb');
const { client } = require('../bin/database');
const { ObjectId } = require('mongodb');
// const uri = "mongodb://localhost:27017/";
// const client = new MongoClient(uri);

module.exports = {
  queryGET: async (database, collection, filter) => {
    return new Promise(async (resolve, reject) => {

      await client
        .db(database)
        .collection(collection)
        .find(filter, {})
        .toArray()
        .then(results => {
          resolve(results)
          // console.log(results)
        })
        .catch((err) => {
          reject(err);
        });

    });
  },

  queryPOST: async (db, collection, doc) => {
    return new Promise(async (resolve, reject) => {

      // await client.connect();

      await client
        .db(db)
        .collection(collection)
        .insertOne(doc)
        .then(results => {
          resolve(results)
          console.log(doc)
        })
        .catch((err) => {
          reject(err);
        });

    });
  },

  queryPUT: async (db, collection, filter, doc) => {
    return new Promise(async (resolve, reject) => {

      // await client.connect();        
      const updatedDocument = {
        $set: doc
      };

      await client
        .db(db)
        .collection(collection)
        .updateOne(filter, updatedDocument)
        .then(results => {
          resolve(results)
          console.log(filter)
        })
        .catch((err) => {
          reject(err);
        });

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