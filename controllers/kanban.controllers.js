const { machine } = require("os");
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
    queryJOIN,
    queryJOIN2,
    ObjectId,
} = require("../helpers/queryMongo");
const { client } = require("../bin/database");

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect', error)
        }
    },

    listItemcheck: async (req, res) => {
        try {
            const filter = {};
            let itemcheck = {};

            if (req.body.kanban_id) {
                filter._id = new ObjectId(`${req.body.kanban_id}`);
                itemcheck = await queryGET("kanban", filter)


                const itemcheck_id = itemcheck[0].itemcheck_id;

                let filter2 = {};
                let results = [];

                for (let index = 0; index < itemcheck_id.length; index++) {
                    filter2._id = new ObjectId(`${itemcheck_id[index]}`);
                    console.log(filter2)
                    results[index] = (await queryGET('itemcheck', filter2))[0];
                    console.log(results)
                    response.success(res, "Success getting itemcheck", results)
                }

            } else if (req.body.machine_id) {
                let results = await client.collection('itemcheck').aggregate([
                    {
                        $lookup: {
                            from: "part",
                            localField: "part_id",
                            foreignField: "_id",
                            as: "part",
                            pipeline: [
                                {
                                    $match: { machine_id: new ObjectId(`${req.body.machine_id}`) }
                                }]
                        }
                    },
                    {
                        $unwind: "$part"
                    },
                    {
                        $lookup: {
                            from: "machine",
                            localField: "part.machine_id",
                            foreignField: "_id",
                            as: "machine"
                        }
                    },
                    {
                        $unwind: "$machine"
                    },
                    {
                        $project: {
                            itemcheck_nm: 1,
                            std: 1,
                            min: 1,
                            max: 1,
                            part_id: 1,
                            part_nm: "$part.part_nm",
                            machine_id: "$part.machine_id",
                            machine_nm: "$machine.machine_nm"
                        }
                    }
                ]).toArray()
                response.success(res, "Success getting itemcheck", results)
            }

        } catch (error) {
            response.failed(res, 'Failed to get itemcheck', error)
        }
    },

    addItemCheck: async (req, res) => {
        try {
            const data = req.body

            let doc = {
                created_by: data.created_by,
                created_dt: new Date(),
                itemcheck_nm: data.itemcheck_nm,
                std: data.std,
                period: data.period,
                part_id: new ObjectId(`${data.part_id}`)
            }

            if (data.min || data.max) {
                doc.min = data.min;
                doc.max = data.max
            }

            const result_item = await queryPOST("itemcheck", doc);

            const part_data = await queryGET("part", { _id: new ObjectId(`${data.part_id}`) })

            if (data.period == "A") {
                const filter = {
                    $and: [
                        {
                            'machine_id': part_data[0].machine_id
                        }, {
                            'period': 'A'
                        }
                    ]
                }

                console.log(filter)

                const push = {
                    $push: {
                        'itemcheck_id': new ObjectId(`${result_item.insertedId}`)
                    }
                }
                console.log(push)

                const result_kanban = await client.collection('kanban').updateMany(
                    filter, push
                );
                console.log(result_kanban)

            }
            if (data.period == "B") {
                filter = `{
                    '$or': [
                      {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'A'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'B'
                          }
                        ]
                      }
                    ]
                  }`
            }
            if (data.period == "C") {
                filter = `{
                    '$or': [
                      {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'A'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'B'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'C'
                          }
                        ]
                      }
                    ]
                  }`
            }
            if (data.period == "D") {
                filter = `{
                    '$or': [
                      {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'A'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'B'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'C'
                          }
                        ]
                      }, {
                        '$and': [
                          {
                            'machine_id': new ObjectId('${part_data[0].machine_id}')
                          }, {
                            'period': 'D'
                          }
                        ]
                      }
                    ]
                  }`
            }

            console.log(result_kanban)

            response.success(res, "Success getting itemcheck", result_item)

        } catch (error) {
            response.failed(res, 'Failed to get itemcheck', error)
        }
    },

    listKanban: async (req, res) => {
        try {

            const filter = {};

            if (req.body.machine_id) {
                filter.machine_id = new ObjectId(`${req.body.machine_id}`)
            }


            const doc = {
                'period': 1,
                'kanban_nm': 1,
                'machine_nm': `$machine.machine_nm`,
                'machine_id': `$machine._id`,
                'itemcheck_id': 1
            }

            const results = await queryJOIN("kanban", "machine", "machine_id", "_id", doc, filter)
            response.success(res, "Success getting itemcheck", results)

        } catch (error) {
            response.failed(res, 'Failed to get itemcheck', error)
        }
    },

    listItemcheckMachine: async (req, res) => {
        try {

            response.success(res, "Successfully connected to backend", results)

        } catch (error) {
            response.failed(res, 'Failed to connect', error)
        }
    },
}

/* 
async function addMultipleFriends(userId, newFriends) {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the MongoDB server
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Push multiple friends into the array
    const result = await usersCollection.updateOne(
      { _id: ObjectId(userId) },
      { 
        $push: { 
          friends: { 
            $each: newFriends // Add multiple items to the array
          }
        }
      );

    console.log(result.modifiedCount, 'document(s) updated');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Call the function with an array of new friends
addMultipleFriends('603c72ef7c76b4d1b69f3b5d', ['David', 'Eve']);
*/