const { machine } = require("os");
const { ObjectId } = require('mongodb');
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
    queryJOIN,
} = require("../helpers/queryMongo");
let timestampDay = 24 * 60 * 60 * 1000;

const assetDB = 'pm_module';

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect')
        }
    },

    listItemcheck: async (req, res) => {
        try {

            // const data = req.body;

            const doc = {
                'itemcheck_nm': 1,
                'std': 1,
                'min': 1, 
                'max': 1, 
                'period': 1,
                'part_nm': `$part.part_nm`,
                'part_id': `$part._id`
            }

            const results = await queryJOIN("pm_module", "itemcheck", "part", "part_id", "_id", doc)
            response.success(res, "Successfully connected to backend", results)

        } catch (error) {
            response.failed(res, 'Failed to connect')
        }
    }
}