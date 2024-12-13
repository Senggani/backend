const response = require("../helpers/response");
const { client } = require('../bin/database');
const query = require("../helpers/queryMongo");
const { Timestamp } = require("mongodb");

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect', error)
        }
    },
    readData: async (req, res) => {
        try {
            const data = req.query

            // const projection = { _id: 0, timestamp: 1, x: "$acceleration.x", y: "$acceleration.y", z: "$acceleration.z" }

            let filter = {}
            if (data.sensor_id) {
                filter = { 'metadata.sensorId': data.sensor_id }
            }
            if (data.newest_dt) {
                filter.timestamp = { $gt: new Date(data.newest_dt) }
            }
            if (data.oldest_dt) {
                filter.timestamp = { $lte: new Date(data.oldest_dt) }
            }
            if (data.newest_dt && data.oldest_dt) {
                filter.timestamp = { $lte: new Date(data.newest_dt), $gt: new Date(data.oldest_dt) }
            }

            let results = await query.queryTS("sensor01_acc_xyz", filter, {}, (data.limit ? parseInt(data.limit) : 100))
            response.success(res, `Success reading data`, results)
        } catch (error) {
            response.failed(res, `Failed to connect`, error)
        }
    },
}