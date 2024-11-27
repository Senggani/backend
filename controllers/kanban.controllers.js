const { machine } = require("os");
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");
const multer = require("multer")
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

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
      console.log(1)
      response.success(res, `Successfully connected to backend`, req.body)
    } catch (error) {
      response.failed(res, `Failed to connect`, error)
    }
  },

  addItemcheck: async (req, res) => {
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

      const result_item = await query.queryPOST("itemcheck", doc);

      const part_data = await query.queryGET("part", { _id: new ObjectId(`${data.part_id}`) })


      let filter = { machine_id: part_data[0].machine_id };

      if (data.period == "A") {
        filter.period = "A"
      }
      if (data.period == "B") {
        filter.$or = [
          { period: "A" },
          { period: "B" }
        ]
      }
      if (data.period == "C") {
        filter.$or = [
          { period: "A" },
          { period: "B" },
          { period: "C" }
        ]
      }
      if (data.period == "D") {
        filter.$or = [
          { period: "A" },
          { period: "B" },
          { period: "C" },
          { period: "D" }
        ]
      }

      await database.connect();

      let results = await client.collection('kanban').updateMany(filter, { $push: { 'itemcheck_id': result_item.insertedId } })

      response.success(res, "Success adding itemcheck", { results, result_item })

    } catch (error) {
      response.failed(res, 'Failed to add itemcheck', error)
    } finally {
      await database.close();
    }
  },

  editItemcheck: async (req, res) => {
    try {
      let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };
      const data = req.body

      let doc = {
        updated_by: data.created_by,
        updated_dt: new Date(),
      }
      if (data.itemcheck_nm) {
        doc.itemcheck_nm = data.itemcheck_nm
      }
      if (data.std) {
        doc.std = data.std
      }
      if (data.part_id) {
        doc.part_id = new ObjectId(`${data.part_id}`)
      }
      if (data.min) {
        doc.min = data.min;
      }
      if (data.max) {
        doc.max = data.max;
      }

      const results = await query.queryPUT("itemcheck", filter, doc)

      response.success(res, `Success editting itemcheck`, results)

    } catch (error) {
      response.failed(res, `Failed to edit itemcheck`, error)
    }
  },

  listItemcheck: async (req, res) => {
    try {

      let filter = { deleted_by: null };
      let itemcheck = {};

      if (req.body.kanban_id) {
        filter._id = new ObjectId(`${req.body.kanban_id}`);
        itemcheck = await query.queryGET("kanban", filter)


        const itemcheck_id = itemcheck[0].itemcheck_id;

        let filter2 = {};
        let results = [];

        for (let index = 0; index < itemcheck_id.length; index++) {
          filter2._id = new ObjectId(`${itemcheck_id[index]}`);
          console.log(filter2)
          results[index] = (await query.queryGET('itemcheck', filter2))[0];
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

  historyItemcheck: async (req, res) => {
    try {
      const filter = { 'itemcheck.itemcheck_id': new ObjectId(req.query.id) };

      const projection = {
        'itemcheck.$': 1
      };

      await database.connect();

      let results = [];

      const itemcheck = await client.collection("kanban_history").find(filter, { projection }).toArray()
      itemcheck.forEach(doc => {
        results.push(doc.itemcheck[0])
      });

      response.success(res, "Success getting itemcheck history", (results));

      await database.close()
    } catch (error) {
      response.failed(res, 'Failed to get itemcheck history', error)
    }
  },

  deleteItemcheck: async (req, res) => {
    try {
      await database.connect();
      const data = req.body

      let filter_itemcheck = { deleted_by: null, _id: new ObjectId(req.query.id) };
      const result_item = await client.collection("itemcheck").findOne(filter_itemcheck);

      let doc = {
        deleted_by: data.user_id,
        deleted_dt: new Date(),
      }

      const part_data = await client.collection("part").findOne({ _id: result_item.part_id });
      let filter = { deleted_by: null, machine_id: part_data.machine_id };

      console.log(part_data)
      const updatedDocument = {
        $set: doc
      };

      const delete_item = await client
        .collection("itemcheck")
        .updateOne(filter_itemcheck, updatedDocument)
        .catch((err) => {
          reject(err);
        });

      if (result_item.period == "A") {
        filter.period = "A"
      }
      if (result_item.period == "B") {
        filter.$or = [
          { period: "A" },
          { period: "B" }
        ]
      }
      if (result_item.period == "C") {
        filter.$or = [
          { period: "A" },
          { period: "B" },
          { period: "C" }
        ]
      }
      if (result_item.period == "D") {
        filter.$or = [
          { period: "A" },
          { period: "B" },
          { period: "C" },
          { period: "D" }
        ]
      }

      let results = await client.collection('kanban').updateMany(filter, { $pull: { 'itemcheck_id': result_item._id } })
      response.success(res, `Success deleting itemcheck`, { delete_item, results })
    } catch (error) {
      response.failed(res, `Failed to delete itemcheck`, error)
    } finally {
      await database.close();
    }
  },

  listKanban: async (req, res) => {
    try {

      let filter = { deleted_by: null };

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

      const results = await query.queryJOIN("kanban", "machine", "machine_id", "_id", doc, filter)
      response.success(res, "Success getting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to get itemcheck', error)
    }
  },

  editKanban: async (req, res) => {
    try {

      const data = req.body

      let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };

      let doc = {
        updated_by: data.user_id,
        updated_dt: new Date()
      }
      if (data.kanban_nm) {
        doc.kanban_nm = data.kanban_nm
      }
      if (data.machine_id) {
        doc.machine_id = data.machine_id
      }

      const results = await query.queryPUT("kanban", filter, doc)
      response.success(res, "Success editting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to edit itemcheck', error)
    }
  },

  deleteKanban: async (req, res) => {
    try {

      const data = req.body

      let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };

      let doc = {
        deleted_by: data.user_id,
        deleted_dt: new Date()
      }

      const results = await query.queryPUT("kanban", filter, doc)
      response.success(res, "Success editting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to edit itemcheck', error)
    }
  },

  submitKanban: async (req, res) => {
    try {
      const data = req.body
      const file = req.files

      let itemcheck = []

      for (let index = 0; index < file.length; index++) {
        itemcheck[index] = {
          itemcheck_id: new ObjectId(data.itemcheck_id[index]),
          filename: file[index].filename,
          contentType: file[index].mimetype,
        }

        let check_value = await query.queryGET("itemcheck", { _id: new ObjectId(data.itemcheck_id[index]) })

        if (check_value[0].std == 'value') {

          imagePath = './uploads/itemcheck/' + file[index].filename;

          await Tesseract.recognize(
            imagePath,
            'eng',
          ).then(({ data: { text } }) => {
            recognizedText = text;
          }).catch((err) => {
            console.error('Error:', err);
          });

          itemcheck[index].value = parseFloat(data.value[index]);
          itemcheck[index].ocr_value = recognizedText;
        } else {
          itemcheck[index].value = data.value[index];
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

  historyKanban: async (req, res) => {
    try {
      let filter = {};
      let results = {};
      let filePath;

      if (req.query.kanban_id) {

        filter.kanban_id = new ObjectId(req.query.kanban_id);
        const results = await query.queryGET("kanban_history", filter);
        response.success(res, "Success getting kanban history", results);

      } else if (req.query.id) {

        filter._id = new ObjectId(req.query.id);
        const itemcheck = await query.queryGET("kanban_history", filter);
        itemcheck.forEach(doc => {
          results = doc;
        });

        results.itemcheck.forEach(doc => {
          filePath = path.join(__dirname, `../uploads/itemcheck/${doc.filename}`);
          res.sendFile(filePath);
          // Kalau saat integrasi gagal, pakai api download di ftp dengan input filename diatas OK
        })

        response.success(res, "Success getting kanban history", results);

      } else {
        const results = await query.queryGET("kanban_history", filter);
        response.success(res, "Success getting kanban history", results);
      }

    } catch (error) {
      response.failed(res, 'Failed to get kanban history', error)
    }
  },

  listWorkOrder: async (req, res) => {
    try {
      let filter = { deleted_by: null };
      if (req.query.id) {
        filter._id = new ObjectId(req.query.id)
      }
      if (req.query.user_id) {
        filter.user_id = new ObjectId(req.query.user_id)
      }
      if (req.query.kanban_id) {
        filter.kanban_id = new ObjectId(req.query.kanban_id)
      }
      if (req.query.created_by) {
        filter.created_by = req.query.created_by
      }
      const result_item = await query.queryGET("work_order", filter);
      response.success(res, `Success getting work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to get work order`, error)
    }
  },

  addWorkOrder: async (req, res) => {
    try {

      const data = req.body

      let doc = {
        created_by: data.created_by,
        created_dt: new Date(),
        kanban_id: new ObjectId(data.kanban_id),
        user_id: new ObjectId(data.user_id),
        work_dt: data.date
      }
      const result_item = await query.queryPOST("work_order", doc);
      response.success(res, `Success adding work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to add work order`, error)
    }
  },

  editWorkOrder: async (req, res) => {
    try {
      const filter = { _id: new ObjectId(req.query.id), deleted_by: null }

      const data = req.body

      let doc = {
        updated_by: data.user_id,
        updated_dt: new Date(),
      }

      if (data.kanban_id) {
        doc.kanban_id = data.kanban_id
      }
      if (data.user_id) {
        doc.user_id = data.user_id
      }
      if (data.date) {
        doc.work_dt = data.date
      }

      const result_item = await query.queryPUT("work_order", filter, doc);
      response.success(res, `Success editting work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to edit work order`, error)
    }
  },

  deleteWorkOrder: async (req, res) => {
    try {
      const filter = { _id: new ObjectId(req.query.id), deleted_by: null }

      const data = req.body

      let doc = {
        deleted_by: data.user_id,
        deleted_dt: new Date(),
      }

      const result_item = await query.queryPUT("work_order", filter, doc);
      response.success(res, `Success deletin work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to delete work order`, error)
    }
  },

  upload,
}

/*   
   \ \
   ( o>
\\_//\
 \_/_/
  _|_
*/