const response = require("../helpers/response");
const { client } = require('../bin/database');
const {
    queryGET,
    queryPOST,
    queryPUT,
    queryTS,
} = require("../helpers/queryMongo");
const { Timestamp } = require("mongodb");

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect')
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
                filter.timestamp = { $gt: new Date(data.newest_dt), $lte: new Date(data.oldest_dt) }
            }
            // console.log([projection, filter, data])

            let results = await queryTS("sensor01_acc_xyz", filter, {}, (data.limit ? parseInt(data.limit) : 100))
            response.success(res, `Success reading data`, results)
        } catch (error) {
            response.failed(res, `Failed to connect`)
        }
    },

    // insertData: async (req, res) => {
    //     try {

    //         const data = req.body

    //         const sensorData = {
    //             timestamp: new Date(),
    //             metadata: { sensor_id: data.sensor_id, sensor_nm: data.sensor_nm, unit: data.unit },
    //             value: data.value
    //         }

    //         const results = await client.db('location').collection('timeseries').insertOne(sensorData)

    //         response.success(res, `Success adding ${data.sensor_nm} data`, results)
    //     } catch (error) {
    //         response.failed(res, 'Failed to connect')
    //     }
    // },

    // readData: async (req, res) => {
    //     try {

    //         const data = req.body
    //         const projection = {
    //             'value': 1,
    //             'timestamp': 1,
    //             '_id': 0
    //         }

    //         let results = {sensor_id: data.sensor_id}

    //         results.value = await client.db('location').collection('timeseries').find(
    //             { 'metadata.sensor_id': data.sensor_id },
    //             { projection })
    //             .toArray();

    //         response.success(res, `Success reading data`, results)
    //     } catch (error) {
    //         response.failed(res, 'Failed to connect')
    //     }
    // },

}