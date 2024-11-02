// const {
//     queryCustom,
// } = require("../helpers/query");

const { machine } = require("os");
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
} = require("../helpers/queryMongo");
let timestampDay = 24 * 60 * 60 * 1000;

const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect')
        } finally {
            await client.close();
        }
    },

    getMachineList: async (req, res) => {
        try {
            const data = req.body

            let filter = {};

            if (data.station_id) {
                filter = {'station_id': data.station_id};
            }

            const machineList = await queryGET('location', 'machine', filter )

            response.success(res, "success getting machine data", machineList);

        }
        catch (error) {
            response.failed(res, 'Error to connection')
        }
    },

    newMachine: async (req, res) => {
        try {
            const data = req.body
            
            const doc = {
                machine_nm: data.machine_nm,
                created_by: data.created_by,
                created_dt: new Date(),
                station_id: data.station_id,
                core_equipment_id: data.core_equipment_id
            }

            const result = await queryPOST('location', 'machine', doc);

            response.success(res, "success adding machine data", result);

        }
        catch (error) {
            response.failed(res, 'Error to connection')
        }
    },

    editMachine: async (req, res) => {
        try {
            const data = req.body
            
            const doc = {
                machine_nm: data.machine_nm,
                created_by: data.created_by,
                created_dt: new Date(),
                station_id: data.station_id,
                core_equipment_id: data.core_equipment_id
            }

            const result = await queryPOST('location', 'machine', doc);

            response.success(res, "success adding machine data", result);

        }
        catch (error) {
            response.failed(res, 'Error to connection')
        }
    },
}