const table = require("../../config/table");
const {
    queryPOST,
    queryPUT,
    queryGET,
    queryCustom,
    queryBulkPOST,
} = require("../../helpers/query");

const response = require("../../helpers/response");
const { groupFunction } = require("../../functions/groupFunction");
const queryHandler = require("../queryhandler.function");
const getLastIdData = require("../../helpers/getLastIdData");
const { v4 } = require("uuid");
const { getRounds } = require("bcryptjs");
let timestampDay = 24 * 60 * 60 * 1000;

async function uuidToId(table, col, uuid) {
    // // console.log(`SELECT ${col} FROM ${table} WHERE uuid = '${uuid}'`);
    // `SELECT ${col} FROM ${table} WHERE uuid = '${uuid}'`
    let rawId = await queryGET(table, `WHERE uuid = '${uuid}'`, [col]);
    return rawId[0][col];
}

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "successfully connected");
        } catch (error) {
            response.failed(res, 'Error to connection')
        }
    },

    getMachineData: async (req, res) => {
        try {
            let data = req.query

            let machine_q = `
                SELECT 
                    tb_m_machines.machine_id AS id,
                    tb_m_machines.machine_nm AS name
                FROM 
                    tb_m_machines
                WHERE
                    tb_m_machines.station_id = $1 AND deleted_by IS NULL
            `

            cons = (await queryCustom(machine_q, [data.station_id])).rows

            response.success(res, "success to get machine list", cons);
        } catch (error) {
            response.failed(res, 'Error to get machine list')
        }
    },

    getStationData: async (req, res) => {
        try {
            let data = req.query

            let q = `
                SELECT 
                    tb_m_stations.station_id AS id,
                    tb_m_stations.station_nm AS name
                FROM 
                    tb_m_stations
                WHERE
                    tb_m_stations.line_id = $1 AND deleted_by IS NULL
            `

            cons = (await queryCustom(q, [data.line_id])).rows

            response.success(res, "success to get station list", cons);
        } catch (error) {
            response.failed(res, 'Error to get station list')
        }
    },

    getLineData: async (req, res) => {
        try {
            let data = req.query

            let q = `
                SELECT 
                tb_m_lines.line_id AS id,
                    tb_m_lines.line_nm AS name
                FROM 
                    tb_m_lines
                WHERE
                    tb_m_lines.shop_id = $1 AND deleted_by IS NULL
            `

            cons = (await queryCustom(q, [data.shop_id])).rows

            response.success(res, "success to get line list", cons);
        } catch (error) {
            response.failed(res, 'Error to get line list')
        }
    },

    getShopData: async (req, res) => {
        try {
            let data = req.query

            let q = `
                SELECT 
                tb_m_shops.shop_id AS id,
                    tb_m_shops.shop_nm AS name
                FROM 
                    tb_m_shops
                WHERE
                    tb_m_shops.plant_id = $1 AND deleted_by IS NULL
            `

            cons = (await queryCustom(q, [data.plant_id])).rows

            response.success(res, "success to get shop list", cons);
        } catch (error) {
            response.failed(res, 'Error to get shop list')
        }
    },

    getPlantData: async (req, res) => {
        try {
            let data = req.query

            let q = `
                SELECT 
                tb_m_plants.plant_id AS id,
                    tb_m_plants.plant_nm AS name
                FROM 
                    tb_m_plants
                WHERE
                    tb_m_plants.company_id = $1 AND deleted_by IS NULL
            `

            cons = (await queryCustom(q, [data.company_id])).rows

            response.success(res, "success to get plant list", cons);
        } catch (error) {
            response.failed(res, 'Error to get plant list')
        }
    },

    addMachine: async (req, res) => {
        try {
            let data = req.body

            let q = `
            INSERT INTO public.tb_m_machines (machine_nm, station_id, core_equipment_id, created_by)
            VALUES ($1, $2, $3, $4)
            `

            await queryCustom(q, [data.machine_nm, data.station_id, data.core_equipment_id, data.user_nm]);

            response.success(res, `success to add machine ${data.machine_nm}`);
        } catch (error) {
            response.failed(res, `Error to add machine`)
        }
    },

    addStation: async (req, res) => {
        try {
            let data = req.body

            let q = `
            INSERT INTO public.tb_m_stations (station_nm, line_id, created_by)
            VALUES ($1, $2, $3)
            `

            cons = await queryCustom(q, [data.station_nm, data.line_id, data.user_nm]);

            response.success(res, `success to add station ${data.station_nm}`);
        } catch (error) {
            response.failed(res, `Error to add station`)
        }
    },

    addLine: async (req, res) => {
        try {
            let data = req.body

            let q = `
            INSERT INTO public.tb_m_lines (line_nm, shop_id, created_by)
            VALUES ($1, $2, $3)
            `

            cons = await queryCustom(q, [data.line_nm, data.shop_id, data.user_nm]);

            response.success(res, `success to add line ${data.line_nm}`);
        } catch (error) {
            response.failed(res, `Error to add line`)
        }
    },

    addShop: async (req, res) => {
        try {
            let data = req.body

            let q = `
            INSERT INTO public.tb_m_shops (shop_nm, plant_id, created_by)
            VALUES ($1, $2, $3)
            `

            cons = await queryCustom(q, [data.shop_nm, data.plant_id, data.user_nm]);

            response.success(res, `success to add shop ${data.shop_nm}`);
        } catch (error) {
            response.failed(res, `Error to add shop`)
        }
    },

    editMachine: async (req, res) => {
        try {
            let data = req.body

            // console.log(data)

            let q = `
            UPDATE public.tb_m_machines 
                SET machine_nm = $1, updated_by = $2, updated_dt = CURRENT_TIMESTAMP::TIMESTAMP
            WHERE machine_id = $3
            `

            cons = (await queryCustom(q, [data.new_name, data.updated_by, data.machine_id])).rows

            response.success(res, "success to edit machine", cons);
        } catch (error) {
            response.failed(res, 'Error to edit machine')
        }
    },

    deleteMachine: async (req, res) => {
        try {
            let data = req.body

            // console.log(data)

            let q = `
            UPDATE public.tb_m_machines 
            SET deleted_by = $1, deleted_dt = CURRENT_TIMESTAMP::TIMESTAMP
            WHERE machine_id = $2
            `

            cons = (await queryCustom(q, [data.user_id, data.machine_id])).rows

            response.success(res, "success to delete machine", cons);
        } catch (error) {
            response.failed(res, 'Error to delete machine')
        }
    },

    tableActivities: async (req, res) => {
        try {

            let input_data = req.body

            let machine_q = `
      SELECT 
        public.v_schedules_monthly.plan_check_dt as dates,
        public.v_schedules_monthly.id as kanbanNo,
        public.v_schedules_monthly.itemcheck_nm as location,
        public.v_schedules_monthly.machine_nm as machineNo,
        public.v_schedules_monthly.method_check as action,
        public.v_schedules_monthly.status_nm as status
      FROM 
        public.v_schedules_monthly
      WHERE public.v_schedules_monthly.plan_check_dt BETWEEN '${input_data.date_start} 00:00:00' AND '${input_data.date_end} 00:00:00'
      ORDER BY public.v_schedules_monthly.plan_check_dt
      `

            let items = [
                {
                    kanban_No: [],
                }
            ];

            items = (await queryCustom(machine_q)).rows

            // cons.forEach(cons => {
            //   items.push(cons ?? 0);
            //   // items[0].dates.push(cons.dates ?? 0);
            //   // items[0].kanbanNo.push(cons.kanbanno ?? 0);
            //   // labels.push(cons.line_nm);
            //   // // console.log(schedule);
            // });

            // console.log(cons);

            const activities = {
                items
            };

            response.success(res, "success to get table activities", activities);
        } catch (error) {
            // console.log(error);
            response.failed(res, 'Error to get data')
        }
    }
}