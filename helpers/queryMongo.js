// const { MongoClient } = require('mongodb');
const { client } = require('../bin/database');
const { ObjectId } = require('mongodb');
// const uri = "mongodb://localhost:27017/";
// const client = new MongoClient(uri);

module.exports = {
  queryGET: async (database, collection, filter) => {
    return new Promise(async (resolve, reject) => {
      try {
        await client.connect();

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
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }

    });
  },

  queryPOST: async (db, collection, doc) => {
    return new Promise(async (resolve, reject) => {
      try {
        await client.connect();

        await client
          .db(db)
          .collection(collection)
          .insertOne(doc)
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }

    });
  },

  queryPUT: async (db, collection, filter, doc) => {
    return new Promise(async (resolve, reject) => {
      try {
        await client.connect();

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
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }

    });
  },

  queryJOIN: async (db, localCollection, foreignCollection, localCol, foreignCol, doc, filter) => {
    return new Promise(async (resolve, reject) => {
      try {

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client
          .db(db)
          .collection(localCollection)
          .aggregate([
            {
              $lookup: {
                from: foreignCollection,
                localField: localCol,
                foreignField: foreignCol,
                as: foreignCollection
              }
            },
            {
              $unwind: `$${foreignCollection}`
            },
            {
              $project: doc
            },
            {
              $match: filter
            }
          ])
          .toArray()
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }

    });
  },

  // queryJOIN2: async (db, localCollection, foreignCollection, localCol, foreignCol, foreignCollection2, localCol2, foreignCol2, doc, filter) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       // Connect the client to the server	(optional starting in v4.7)
  //       await client.connect();
  //       // Send a ping to confirm a successful connection
  //       await client
  //         .db(db)
  //         .collection(localCollection)
  //         .aggregate([
  //           {
  //             $lookup: {
  //               from: foreignCollection,
  //               localField: localCol,
  //               foreignField: foreignCol,
  //               as: foreignCollection
  //             }
  //           },
  //           {
  //             $unwind: `$${foreignCollection}`
  //           },
  //           {
  //             $lookup: {
  //               from: foreignCollection2,
  //               localField: localCol2,
  //               foreignField: foreignCol2,
  //               as: foreignCollection2
  //             }
  //           },
  //           {
  //             $unwind: `$${foreignCollection2}`
  //           },
  //           {
  //             $project: doc
  //           },
  //           {
  //             $match: filter
  //           }
  //         ])
  //         .toArray()
  //         .then(results => {
  //           resolve(results)
  //         })
  //         .catch((err) => {
  //           reject(err);
  //         });
  //     } finally {
  //       // Ensures that the client will close when you finish/error
  //       await client.close();
  //     }

  //   });
  // },

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