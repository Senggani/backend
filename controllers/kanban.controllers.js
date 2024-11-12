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
let timestampDay = 24 * 60 * 60 * 1000;

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

            if (req.body.machine_id) {
                filter.machine_id = new ObjectId(`${req.body.machine_id}`)
            }

            if (req.body.kanban_id) {
                filter.kanban_id = new ObjectId(`${req.body.kanban_id}`)
            }

            const doc = {
                'itemcheck_nm': 1,
                'std': 1,
                'min': 1,
                'max': 1,
                'period': 1,
                'kanban_id': `$tb_r_kanban_itemcheck.kanban_id`,
                'machine_id': `$tb_r_kanban_itemcheck.machine_id`
            }

            const results = await queryJOIN("itemcheck", "tb_r_kanban_itemcheck", "_id", "itemcheck_id", doc, filter)
            response.success(res, "Success getting itemcheck", results)

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
                part_id: new ObjectId(`{data.part_id}`)
            }

            if (data.min || data.max) {
                doc.min = data.min,
                doc.max = data.max
            }

            const results = await queryPOST("itemcheck", doc);

            response.success(res, "Success getting itemcheck", results)

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
                'period': `$kanban.period`,
                'kanban_nm': `$kanban.kanban_nm`,
                'machine_nm': `$machine.machine_nm`,
                'kanban_id': `$kanban._id`,
                'machine_id': `$machine._id`
            }

            const results = await queryJOIN2("tb_r_kanban_itemcheck", "kanban", "kanban_id", "_id", "machine", "machine_id", "_id", doc, filter)
            response.success(res, "Success getting itemcheck", results)

        } catch (error) {
            response.failed(res, 'Failed to get itemcheck', error)
        }
    },

    // listItemcheckMachine: async (req, res) => {
    //     try {

    //         const data = req.param;

    //         const doc = {
    //             'itemcheck_nm': 1,
    //             'std': 1,
    //             'min': 1, 
    //             'max': 1, 
    //             'period': 1,
    //             'part_id': `$part._id`,
    //             'part_nm': `$part.part_nm`,
    //             'machine_id': `$machine._id`,
    //             'machine_nm': `$machine.machine_nm`
    //         };

    //         const filter = {
    //             "machine_id": new ObjectId(`${data.machine_id}`)
    //         }

    //         const results = await queryJOIN("pm_module", "itemcheck", "part", "part_id", "_id", "part", "machine_id", "_id", "machine", doc, filter)
    //         response.success(res, "Successfully connected to backend", results)

    //     } catch (error) {
    //         response.failed(res, 'Failed to connect')
    //     }
    // }
}