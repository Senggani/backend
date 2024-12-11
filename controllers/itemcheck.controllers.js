const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, `Successfully connected to backend`, req.body)

        } catch (error) {
            response.failed(res, `Failed to connect`, error.message)
        }
    },

    addItemcheck: async (req, res) => {
        try {
            const data = req.body

            let doc = {
                created_by: new ObjectId(req.body.user_id),
                created_dt: new Date(),
                itemcheck_nm: data.itemcheck_nm,
                std: data.std,
                period: data.period,
                part_id: new ObjectId(`${data.part_id}`),
                tools_id: new ObjectId(`${data.tools_id}`)
            }

            if (data.spare_part_id) {
                doc.spare_part_id = new ObjectId(`${data.spare_part_id}`)
            }

            if (data.tools_id) {
                doc.tools_id = new ObjectId(`${data.tools_id}`)
            }

            if (data.min || data.max) {
                doc.min = data.min;
                doc.max = data.max;
                doc.unit = data.unit;
            }

            await database.connect();

            const result_item = await client.collection("itemcheck").insertOne(doc);

            const part_data = await client.collection("part").find({ _id: new ObjectId(`${data.part_id}`) }).toArray();

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

            let results = await client.collection('kanban').updateMany(filter, { $push: { 'itemcheck_id': result_item.insertedId } })

            response.success(res, "Success adding itemcheck", { doc, results, result_item })

        } catch (error) {
            response.failed(res, 'Failed to add itemcheck', error.message)
        } finally {
            await database.close();
        }
    },

    editItemcheck: async (req, res) => {
        try {
            let filter = { deleted_by: null, _id: new ObjectId(req.query.id) };
            const data = req.body

            let doc = {
                updated_by: new ObjectId(req.body.user_id),
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
            if (data.spare_part_id) {
                doc.spare_part_id = new ObjectId(`${data.spare_part_id}`)
            }
            if (data.min) {
                doc.min = data.min;
            }
            if (data.max) {
                doc.max = data.max;
            }
            if (data.unit) {
                doc.unit = data.unit;
            }
            if (data.tools_id) {
                doc.tools_id = data.tools_id;
            }

            const results = await query.queryPUT("itemcheck", filter, doc)

            response.success(res, `Success editting itemcheck`, results)

        } catch (error) {
            response.failed(res, `Failed to edit itemcheck`, error.message)
        }
    },

    listItemcheck: async (req, res) => {
        try {
            let filter = { deleted_by: null };
            let itemcheck = {};

            if (req.query.kanban_id) {
                filter._id = new ObjectId(`${req.query.kanban_id}`);
                itemcheck = await query.queryGET("kanban", filter)

                const itemcheck_id = itemcheck[0].itemcheck_id;

                let filter2 = {};
                let results = [];

                for (let index = 0; index < itemcheck_id.length; index++) {
                    filter2._id = new ObjectId(`${itemcheck_id[index]}`);
                    results[index] = (await query.queryGET('itemcheck', filter2))[0];
                    response.success(res, "Success getting itemcheck", results)
                }

            } else if (req.query.machine_id) {
                let results = await client.collection('itemcheck').aggregate([
                    {
                        $lookup: {
                            from: "part",
                            localField: "part_id",
                            foreignField: "_id",
                            as: "part",
                            pipeline: [
                                {
                                    $match: { machine_id: new ObjectId(`${req.query.machine_id}`) }
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
                    }
                ]).toArray()
                response.success(res, "Success getting itemcheck", results)
            } else if (req.query.part_id) {
                let results = await client.collection('itemcheck').aggregate([
                    {
                        $lookup: {
                            from: "part",
                            localField: "part_id",
                            foreignField: "_id",
                            as: "part",
                            pipeline: [
                                {
                                    $match: { _id: new ObjectId(`${req.query.part_id}`) }
                                }]
                        }
                    },
                    {
                        $unwind: "$part"
                    }
                ]).toArray()
                response.success(res, "Success getting itemcheck", results)
            }

        } catch (error) {
            response.failed(res, 'Failed to get itemcheck', error.message)
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
            response.failed(res, 'Failed to get itemcheck history', error.message)
        }
    },

    deleteItemcheck: async (req, res) => {
        try {
            await database.connect();
            const data = req.body

            let filter_itemcheck = { deleted_by: null, _id: new ObjectId(req.query.id) };
            const result_item = await client.collection("itemcheck").findOne(filter_itemcheck);

            let doc = {
                deleted_by: new ObjectId(req.body.user_id),
                deleted_dt: new Date(),
            }

            const part_data = await client.collection("part").findOne({ _id: result_item.part_id });
            let filter = { deleted_by: null, machine_id: part_data.machine_id };

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

            let kanban_doc = {
                $push: { 'itemcheck_id': result_item._id },
                $set: {
                    updated_by: new ObjectId(req.body.user_id),
                    updated_dt: new Date(),
                }
            }

            let results = await client.collection('kanban').updateMany(filter, kanban_doc)
            response.success(res, `Success deleting itemcheck`, { delete_item, results })
        } catch (error) {
            response.failed(res, `Failed to delete itemcheck`, error.message)
        } finally {
            await database.close();
        }
    },

    listTools: async (req, res) => {
        try {
            let filter = { deleted_by: null };
            if (req.query.id) {
                filter._id = new ObjectId(req.query.id)
            }
            if (req.query.station_id) {
                filter.station_id = new ObjectId(req.query.station_id)
            }
            const result_item = await query.queryGET("tools", filter);
            response.success(res, `Success getting tools`, result_item)
        } catch (error) {
            response.failed(res, `Failed to get tools`, error.message)
        }
    },

    addTools: async (req, res) => {
        try {

            const data = req.body

            let doc = {
                created_by: new ObjectId(req.user.userId),
                created_dt: new Date(),
                station_id: new ObjectId(data.station_id),
                tool_nm: data.tool_name,
                quantity: data.quantity
            }
            const result_item = await query.queryPOST("tools", doc);
            response.success(res, `Success adding tools`, result_item)
        } catch (error) {
            response.failed(res, `Failed to add tools`, error.message)
        }
    },

    editTools: async (req, res) => {
        try {
            const data = req.body
            const filter = { _id: new ObjectId(data.id), deleted_by: null }

            let doc = {
                updated_by: new ObjectId(req.user.userId),
                updated_dt: new Date(),
            }

            if (data.station_id) {
                doc.station_id = data.station_id
            }
            if (data.tool_nm) {
                doc.tool_nm = data.tool_nm
            }
            if (data.quantity) {
                doc.quantity = data.quantity
            }

            const result_item = await query.queryPUT("tools", filter, doc);
            response.success(res, `Success editting tools`, result_item)
        } catch (error) {
            response.failed(res, `Failed to edit tools`, error.message)
        }
    },

    deleteTools: async (req, res) => {
        try {
            const data = req.body
            const filter = { _id: new ObjectId(data.id), deleted_by: null }

            let doc = {
                deleted_by: new ObjectId(req.user.userId),
                deleted_dt: new Date(),
            }

            const result_item = await query.queryPUT("tools", filter, doc);
            response.success(res, `Success deleting tools`, result_item)
        } catch (error) {
            response.failed(res, `Failed to delete tools`, error.message)
        }
    },

    listSparePart: async (req, res) => {
        try {
            let filter = { deleted_by: null };
            if (req.query.id) {
                filter._id = new ObjectId(req.query.id)
            }
            if (req.query.station_id) {
                filter.station_id = new ObjectId(req.query.station_id)
            }
            const result_item = await query.queryGET("spare_part", filter);
            response.success(res, `Success getting spare part`, result_item)
        } catch (error) {
            response.failed(res, `Failed to get spare part`, error.message)
        }
    },

    addSparePart: async (req, res) => {
        try {

            const data = req.body

            let doc = {
                created_by: new ObjectId(req.body.user_id),
                created_dt: new Date(),
                station_id: new ObjectId(data.station_id),
                spare_part_nm: data.spare_part_nm,
                unit: data.unit,
                quantity: data.quantity
            }
            const result_item = await query.queryPOST("spare_part", doc);
            response.success(res, `Success adding spare part`, result_item)
        } catch (error) {
            response.failed(res, `Failed to add spare part`, error.message)
        }
    },

    editSparePart: async (req, res) => {
        try {
            const data = req.body
            const filter = { _id: new ObjectId(data.id), deleted_by: null }

            let doc = {
                updated_by: new ObjectId(req.user.userId),
                updated_dt: new Date(),
            }

            if (data.station_id) {
                doc.station_id = data.station_id
            }
            if (data.tool_nm) {
                doc.tool_nm = data.tool_nm
            }
            if (data.quantity) {
                doc.quantity = data.quantity
            }
            if (data.unit) {
                doc.unit = data.unit
            }

            const result_item = await query.queryPUT("spare_part", filter, doc);
            response.success(res, `Success editting spare part`, result_item)
        } catch (error) {
            response.failed(res, `Failed to edit spare part`, error.message)
        }
    },

    deleteSparePart: async (req, res) => {
        try {
            const data = req.body
            const filter = { _id: new ObjectId(data.id), deleted_by: null }

            let doc = {
                deleted_by: new ObjectId(req.user.userId),
                deleted_dt: new Date(),
            }

            const result_item = await query.queryPUT("spare_part", filter, doc);
            response.success(res, `Success deleting spare part`, result_item)
        } catch (error) {
            response.failed(res, `Failed to delete spare part`, error.message)
        }
    },
}

/*
   \ \
   ( o>
\\_//\
 \_/_/
  _|_
*/