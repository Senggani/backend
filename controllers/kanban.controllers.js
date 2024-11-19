const { machine } = require("os");
const response = require("../helpers/response");
const {
  queryGET,
  queryPOST,
  queryPUT,
  queryJOIN,
  queryJOIN2,
} = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/itemcheck');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = {
  testConnection: async (req, res) => {
    try {
      console.log(req)
      response.success(res, "Successfully connected to backend", req.form)
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

      let filter = {}

      if (data.period == "A") {
        filter = {
          machine_id: part_data[0].machine_id,
          period: "A"
        }
      }
      if (data.period == "B") {
        filter = {
          machine_id: part_data[0].machine_id,
          $or: [
            { period: "A" },
            { period: "B" }
          ]
        }
      }
      if (data.period == "C") {
        filter = {
          machine_id: part_data[0].machine_id,
          $or: [
            { period: "A" },
            { period: "B" },
            { period: "C" }
          ]
        }
      }
      if (data.period == "D") {
        filter = {
          machine_id: part_data[0].machine_id,
          $or: [
            { period: "A" },
            { period: "B" },
            { period: "C" },
            { period: "D" }
          ]
        }
      }

      await database.connect();

      let results = await client.collection('kanban').updateMany(filter, { $push: { 'itemcheck_id': result_item.insertedId } })

      response.success(res, "Success getting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to get itemcheck', error)
    } finally {
      await database.close();
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

  submitKanban: async (req, res) => {
    try {
      const data = req.body
      const file = req.files

      let itemcheck = {}

      console.log(data.itemcheck_id[0])

      for (let index = 0; index < file.length; index++) {
        itemcheck[index] = {
          itemcheck_id: new ObjectId(data.itemcheck_id[index]),
          value: parseFloat(data.value[index]),
          filename: file[index].filename,
          contentType: file[index].mimetype,
        }
      }

      let doc = {
        kanban_id: new ObjectId(data.kanban_id),
        created_by: new ObjectId(data.created_by),
        created_dt: new Date(),
        itemcheck: itemcheck
      }

      await database.connect()

      const results = await client.collection("kanban_history").insertOne(doc);

      response.success(res, "Success to submit kanban backend", results)

      await database.close()

    } catch (error) {
      response.failed(res, 'Failed to connect', error)
    }
  },

  // submitItemcheck: async (req, res) => {
  //   try {
  //     const data = req.body

  //     let doc = {
  //       itemcheck_id: data.itemcheck_id,
  //       kanban_history_id: data.kanban_history_id,
  //       created_by: data.created_by,
  //       created_dt: new Date(),
  //       itemcheck_value: data.itemcheck_value,
  //       filename: file.filename,
  //       contentType: req.file.mimetype,
  //     }

  //     const results = await queryPOST("itemcheck_history", doc);

  //     response.success(res, "Success to submit itemcheck backend", results)

  //   } catch (error) {
  //     response.failed(res, 'Failed to connect', error)
  //   }
  // },

  upload,
}

/* 
Filter for specific index in array 
const filter = {
  'itemcheck.itemcheck_id': new ObjectId('6730b6ccd298ab0e6c2562b5')
};
const projection = {
  'itemcheck.$': 1
};
const client = await MongoClient.connect(
  'mongodb://localhost:27017/'
);
const coll = client.db('test').collection('history_test');
const cursor = coll.find(filter, { projection });
const result = await cursor.toArray();
await client.close();
 */