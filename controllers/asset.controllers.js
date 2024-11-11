// const {
//     queryCustom,
// } = require("../helpers/query");

const { machine } = require("os");
const { ObjectId } = require('mongodb');
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
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

    listAsset: async (req, res) => {
        try {
            const data = req.body

            let filter = { deleted_by: null };

            if (data.parent_id) {
                if (data.collection == 'machine') {
                    filter.station_id = data.parent_id;
                } else if (data.collection == 'station') {
                    filter.line_id = data.parent_id;
                } else if (data.collection == 'line') {
                    filter.shop_id = data.parent_id;
                } else if (data.collection == 'shop') {
                    filter.plant_id = data.parent_id;
                } else if (data.collection == 'plant') {
                    doc.company_id = data.parent_id;
                }
            }

            if (data.deleted) {
                filter.deleted_by = { $ne: null };
            }

            const stationList = await queryGET(assetDB, data.collection, filter)

            response.success(res, (`Success getting ${data.collection} data`), stationList);

        }
        catch (error) {
            response.failed(res, ("Failed to get data"), error)
        }
    },

    newAsset: async (req, res) => {
        try {
            const data = req.body

            const doc = {
                created_by: data.created_by,
                created_dt: new Date(),
            }

            if (data.collection == 'machine') {
                doc.machine_nm = data.name;
                doc.station_id = data.parent_id;
            } else if (data.collection == 'station') {
                doc.station_nm = data.name;
                doc.line_id = data.parent_id;
            } else if (data.collection == 'line') {
                doc.line_nm = data.name;
                doc.shop_id = data.parent_id;
            } else if (data.collection == 'shop') {
                doc.shop_nm = data.name;
                doc.plant_id = data.parent_id;
            } else if (data.collection == 'plant') {
                doc.plant_nm = data.name;
                doc.company_id = data.parent_id;
            }

            const result = await queryPOST(assetDB, data.collection, doc);

            response.success(res, (`Success adding ${data.collection} data`), result);

        }
        catch (error) {
            response.failed(res, ("Failed to add data"))
        }
    },

    editAsset: async (req, res) => {
        try {
            const data = req.body

            let filter = { '_id': new ObjectId(data._id) };

            let doc = {
                updated_by: data.updated_by,
                updated_dt: new Date()
            };

            if (data.name) {
                if (data.collection == 'machine') {
                    doc.machine_nm = data.name;
                } else if (data.collection == 'station') {
                    doc.station_nm = data.name;
                } else if (data.collection == 'line') {
                    doc.line_nm = data.name;
                } else if (data.collection == 'shop') {
                    doc.shop_nm = data.name;
                } else if (data.collection == 'plant') {
                    doc.plant_nm = data.name;
                }
            }

            if (data.parent_id) {
                if (data.collection == 'machine') {
                    doc.station_id = data.parent_id;
                } else if (data.collection == 'station') {
                    doc.line_id = data.parent_id;
                } else if (data.collection == 'line') {
                    doc.shop_id = data.parent_id;
                } else if (data.collection == 'shop') {
                    doc.plant_id = data.parent_id;
                } else if (data.collection == 'plant') {
                    doc.company_id = data.parent_id;
                }
            }

            const result = await queryPUT(assetDB, data.collection, filter, doc);

            response.success(res, `Success updating ${data.collection} data`, result);

        }
        catch (error) {
            response.failed(res, 'Failed to update data', error)
        }
    },

    deleteAsset: async (req, res) => {
        try {
            const data = req.body

            let filter = { '_id': new ObjectId(data._id) };

            const doc = {
                    deleted_by: data.deleted_by,
                    deleted_dt: new Date()
            };

            const result = await queryPUT(assetDB, data.Collection, filter, doc);

            response.success(res, `Success deleting ${data.collection} data`, result);

        }
        catch (error) {
            response.failed(res, 'Failed to update data', error)
        }
    },
}


// Custom Query
// listMachine: async (req, res) => {
//     try {
//         const data = req.body


//         let filter = { deleted_by: null };

//         if (data.station_id) {
//             filter.station_id = data.station_id ;
//         }

//         if (data.deleted) {
//             filter.deleted_by = { $ne: null } ;
//         }

//         const machineList = await queryGET('location', 'machine', filter)

//         response.success(res, "Success getting machine data", machineList);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to get machine data')
//     }
// },

// newMachine: async (req, res) => {
//     try {
//         const data = req.body

//         const doc = {
//             machine_nm: data.machine_nm,
//             created_by: data.created_by,
//             created_dt: new Date(),
//             station_id: data.station_id,
//             core_equipment_id: data.core_equipment_id
//         }

//         const result = await queryPOST('location', 'machine', doc);

//         response.success(res, "Success adding machine data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to add machine data')
//     }
// },

// editMachine: async (req, res) => {
//     try {
//         const data = req.body

//         let filter = { '_id': new ObjectId(data._id) };

//         let doc = {
//                 updated_by: data.updated_by,
//                 updated_dt: new Date()
//         };

//         if(data.machine_nm) {
//             doc.machine_nm = data.machine_nm;
//         }

//         if(data.station_id) {
//             doc.station_id = data.station_id;
//         }

//         const result = await queryPUT('location', 'machine', filter, doc);

//         response.success(res, "success updating machine data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to update machine data', error)
//     }
// },

// deleteMachine: async (req, res) => {
//     try {
//         const data = req.body

//         let filter = { '_id': new ObjectId(data._id) };

//         const doc = {
//                 deleted_by: data.deleted_by,
//                 deleted_dt: new Date()
//         };

//         const result = await queryPUT('location', 'machine', filter, doc);

//         response.success(res, "success deleting machine data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to update machine data', error)
//     }
// },

// listStation: async (req, res) => {
//     try {
//         const data = req.body


//         let filter = { deleted_by: null };

//         if (data.line_id) {
//             filter.line_id = data.line_id ;
//         }

//         if (data.deleted) {
//             filter.deleted_by = { $ne: null } ;
//         }

//         const stationList = await queryGET('location', 'station', filter)

//         response.success(res, "Success getting station data", stationList);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to get station data')
//     }
// },

// newStation: async (req, res) => {
//     try {
//         const data = req.body

//         const doc = {
//             station_nm: data.station_nm,
//             created_by: data.created_by,
//             created_dt: new Date(),
//             line_id: data.line_id
//         }

//         const result = await queryPOST('location', 'station', doc);

//         response.success(res, "Success adding station data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to add station data')
//     }
// },

// editStation: async (req, res) => {
//     try {
//         const data = req.body

//         let filter = { '_id': new ObjectId(data._id) };

//         let doc = {
//                 updated_by: data.updated_by,
//                 updated_dt: new Date()
//         };

//         if(data.station_nm) {
//             doc.station_nm = data.station_nm;
//         }

//         if(data.line_id) {
//             doc.line_id = data.line_id;
//         }

//         const result = await queryPUT('location', 'station', filter, doc);

//         response.success(res, "success updating station data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to update station data', error)
//     }
// },

// deleteStation: async (req, res) => {
//     try {
//         const data = req.body

//         let filter = { '_id': new ObjectId(data._id) };

//         const doc = {
//                 deleted_by: data.deleted_by,
//                 deleted_dt: new Date()
//         };

//         const result = await queryPUT('location', 'station', filter, doc);

//         response.success(res, "success deleting station data", result);

//     }
//     catch (error) {
//         response.failed(res, 'Failed to update station data', error)
//     }
// },
