const { client, database, ObjectId } = require('../bin/database');

module.exports = {
  queryGET: async (collection, filter) => {
    return new Promise(async (resolve, reject) => {
      try {
        await database.connect();

        await client
          .collection(collection)
          .find(filter, {})
          .toArray()
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await database.close();
      }

    });
  },

  queryGETone: async (collection, filter) => {
    return new Promise(async (resolve, reject) => {
      try {
        await database.connect();

        await client
          .collection(collection)
          .findOne(filter, {})
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await database.close();
      }

    });
  },

  queryPOST: async (collection, doc) => {
    return new Promise(async (resolve, reject) => {
      try {
        await database.connect();

        await client
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
        await database.close();
      }

    });
  },

  queryPUT: async (collection, filter, doc) => {
    return new Promise(async (resolve, reject) => {
      try {
        await database.connect();

        const updatedDocument = {
          $set: doc
        };

        await client
          .collection(collection)
          .updateOne(filter, updatedDocument)
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        await database.close();
      }

    });
  },

  queryJOIN: async (localCollection, foreignCollection, localCol, foreignCol, doc, filter, id) => {
    return new Promise(async (resolve, reject) => {
      try {

        // Connect the client to the server	(optional starting in v4.7)
        await database.connect();
        // Send a ping to confirm a successful connection
        await client
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
        await database.close();
      }

    });
  },

  queryJOIN2: async (localCollection, foreignCollection, localCol, foreignCol, foreignCollection2, localCol2, foreignCol2, doc, filter) => {
    return new Promise(async (resolve, reject) => {
      try {

        // Connect the client to the server	(optional starting in v4.7)
        await database.connect();
        // Send a ping to confirm a successful connection
        await client
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
              $lookup: {
                from: foreignCollection2,
                localField: localCol2,
                foreignField: foreignCol2,
                as: foreignCollection2
              }
            },
            {
              $unwind: `$${foreignCollection2}`
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
        await database.close();
      }

    });
  },

  queryTS: async (collection, filter, projection, limit) => {
    return new Promise(async (resolve, reject) => {
      try {
        await database.connect();

        await client
          .collection(collection)
          .find(filter, { projection })
          .limit(limit)
          .toArray()
          .then(results => {
            resolve(results)
          })
          .catch((err) => {
            reject(err);
          });
      } finally {
        // Ensures that the client will close when you finish/error
        await database.close();
      }

    });
  },

  ObjectId,
  client,

  // querySoftDELETE: async (db, collection, doc) => {
  //   return new Promise(async (resolve, reject) => {

  //     // await client.connect();

  //     await client.db(db).collection(collection).updateOne(doc).then(results => {
  //       resolve(results)
  //     })

  //   });
  // },

  // queryDELETE: async (db, collection, doc) => {
  //   return new Promise(async (resolve, reject) => {

  //     // await client.connect();

  //     await client.db(db).collection(collection).updateOne(doc).then(results => {
  //       resolve(results)
  //     })

  //   });
  // },
}