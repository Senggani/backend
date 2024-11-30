const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");
const multer = require("multer")
const path = require('path');
const Tesseract = require('tesseract.js');
const archiver = require('archiver');

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
      response.success(res, `Successfully connected to backend`, req.body)

    } catch (error) {
      response.failed(res, `Failed to connect`, error.message)
    }
  },

  listKanban: async (req, res) => {
    try {

      let filter = { deleted_by: null };
      let results;

      if (req.query.machine_id) {
        filter.machine_id = new ObjectId(`${req.body.machine_id}`)

        const doc = {
          'period': 1,
          'kanban_nm': 1,
          'machine_nm': `$machine.machine_nm`,
          'machine_id': `$machine._id`,
          'itemcheck_id': 1
        }

        results = await query.queryJOIN("kanban", "machine", "machine_id", "_id", doc, filter)
      }
      else if (req.query.id) {
        filter._id = new ObjectId(`${req.query.id}`)

        database.connect()

        results = await client
          .collection('kanban')
          .aggregate([
            {
              $lookup: {
                from: "machine",
                localField: "machine_id",
                foreignField: "_id",
                as: "machine"
              }
            },
            {
              $unwind: "$machine"
            },
            {
              $lookup: {
                from: "itemcheck",
                localField: "itemcheck_id",
                foreignField: "_id",
                as: "itemcheck"
              }
            },
            {
              $lookup: {
                from: "tools",
                localField: "itemcheck.tools_id",
                foreignField: "_id",
                as: "tools"
              }
            },
            {
              $lookup: {
                from: "spare_part",
                localField: "itemcheck.spare_part_id",
                foreignField: "_id",
                as: "spare_part"
              }
            },
            {
              $match: filter
            }
          ]).toArray()
      }

      console.log(filter)

      response.success(res, "Success getting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to get itemcheck', error.message)
    }
  },

  editKanban: async (req, res) => {
    try {

      const data = req.body

      let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };

      let doc = {
        updated_by: new ObjectId(req.user.userId),
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
      response.failed(res, 'Failed to edit itemcheck', error.message)
    }
  },

  deleteKanban: async (req, res) => {
    try {

      const data = req.body

      let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };

      let doc = {
        deleted_by: new ObjectId(req.user.userId),
        deleted_dt: new Date()
      }

      const results = await query.queryPUT("kanban", filter, doc)
      response.success(res, "Success editting itemcheck", results)

    } catch (error) {
      response.failed(res, 'Failed to edit itemcheck', error.message)
    }
  },

  submitKanban: async (req, res) => {
    try {
      const data = req.body
      const file = req.files

      // console.log(req)

      let itemcheck = []

      await database.connect();

      for (let index = 0; index < file.length; index++) {
        itemcheck[index] = {
          itemcheck_id: new ObjectId(data.itemcheck_id[index]),
          filename: file[index].filename,
          contentType: file[index].mimetype,
        }

        let check_value = await client.collection("itemcheck").findOne({ _id: new ObjectId(data.itemcheck_id[index]) })
        let doc_itemcheck = {
          created_by: new ObjectId(data.user_id),
          created_dt: new Date(),
          kanban_id: new ObjectId(data.kanban_id),
          work_order_id: new ObjectId(data.work_order_id),
          itemcheck_id: check_value._id,
          path: './uploads/itemcheck/' + file[index].filename,
          filename: file[index].filename,
          contentType: file[index].mimetype,
        };

        await client.collection("itemcheck_image").insertOne(doc_itemcheck);

        if (check_value.std == 'value') {

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
        work_order_id: new ObjectId(data.work_order_id),
        created_by: new ObjectId(data.created_by),
        created_dt: new Date(),
        itemcheck: itemcheck
      }

      // await database.connect()

      const results = await client.collection("kanban_history").insertOne(doc);

      response.success(res, "Success to submit kanban backend", results)

      await database.close()

    } catch (error) {
      response.failed(res, 'Failed to connect', error.message)
    }
  },

  historyKanban: async (req, res) => {
    try {
      let filter = {};
      let results = {};
      let filePath = [];

      if (req.query.id) {

        filter._id = new ObjectId(req.query.id);
        const itemcheck = await query.queryGET("kanban_history", filter);
        itemcheck.forEach(doc => {
          results = doc;
        });

        results.itemcheck.forEach((doc, index) => {
          filePath[index] = path.join(__dirname, `../uploads/itemcheck/${doc.filename}`);
        })

        const archive = archiver('zip', {
          zlib: { level: 9 } // Set compression level
        });

        res.attachment('files.zip');

        archive.pipe(res);

        filePath.forEach(file => {
          archive.file(file, { name: path.basename(file) });
        });

        archive.finalize();

        archive.on('error', (err) => {
          response.error(res, err.message)
        });

        response.success(res, "Success getting kanban history", results);

      } else if (req.query.kanban_id) {

        filter.kanban_id = new ObjectId(req.query.kanban_id);
        const results = await query.queryGET("kanban_history", filter);
        response.success(res, "Success getting kanban history", results);

      } else if (req.query.work_order_id) {

        filter.work_order_id = new ObjectId(req.query.work_order_id);
        const results = await query.queryGET("kanban_history", filter);
        response.success(res, "Success getting kanban history", results);

      } else {
        const results = await query.queryGET("kanban_history", filter);
        response.success(res, "Success getting kanban history", results);
      }

    } catch (error) {
      response.failed(res, 'Failed to get kanban history', error.message)
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
      response.failed(res, `Failed to get work order`, error.message)
    }
  },

  addWorkOrder: async (req, res) => {
    try {

      const data = req.body

      let doc = {
        created_by: new ObjectId(req.user.userId),
        created_dt: new Date(),
        kanban_id: new ObjectId(data.kanban_id),
        user_id: new ObjectId(data.user_id),
        work_dt: data.date
      }
      const result_item = await query.queryPOST("work_order", doc);
      response.success(res, `Success adding work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to add work order`, error.message)
    }
  },

  editWorkOrder: async (req, res) => {
    try {
      const filter = { _id: new ObjectId(req.query.id), deleted_by: null }

      const data = req.body

      let doc = {
        updated_by: new ObjectId(req.user.userId),
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
      response.failed(res, `Failed to edit work order`, error.message)
    }
  },

  deleteWorkOrder: async (req, res) => {
    try {
      const filter = { _id: new ObjectId(req.query.id), deleted_by: null }

      const data = req.body

      let doc = {
        deleted_by: new ObjectId(req.user.userId),
        deleted_dt: new Date(),
      }

      const result_item = await query.queryPUT("work_order", filter, doc);
      response.success(res, `Success deletin work order`, result_item)
    } catch (error) {
      response.failed(res, `Failed to delete work order`, error.message)
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

// else if (req.query.id) {

//   filter._id = new ObjectId(req.query.id);
//   const itemcheck = await query.queryGET("kanban_history", filter);
//   itemcheck.forEach(doc => {
//     results = doc;
//   });
//   const form = new FormData();

//   results.itemcheck.forEach((doc, index) => {
//     // filePath[index] = path.join(__dirname, `../uploads/itemcheck/${doc.filename}`);
//     let blob = new Blob(fs.readFileSync(path.join(__dirname, `../uploads/itemcheck/${doc.filename}`)))
//     console.log(fs.readFileSync(path.join(__dirname, `../uploads/itemcheck/${doc.filename}`)))

//     form.append(doc.itemcheck_id, blob, {
//       filename: doc.filename,
//       contentType: doc.contentType,
//       knownLength: fs.statSync(path.join(__dirname, `../uploads/itemcheck/${doc.filename}`)).size,
//     });
//   })
//   // Set headers for multipart response.
//   res.writeHead(200, {
//     'Content-Type': `multipart/form-data; boundary=${'----WebKitFormBoundary' + Math.random().toString(36).substring(2)}`, // boundary must match the one generated by form-data
//     'Content-Length': form.getLengthSync(),
//     'Access-Control-Allow-Credentials': 'true',
//     'Access-Control-Allow-Origin': '*', // Update based on your needs (for demo purposes, '*' is more flexible)
//   });
//   res.json({
//     status: 200,
//     message: 'success to download image',
//     data: results
//   })

//   // Write the multipart form data response.
//   res.write(form.getBuffer());
//   res.end();

// }