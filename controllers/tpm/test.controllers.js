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

  getCompleteness: async (req, res) => {
    try {
      let machine_q = `
      SELECT 
        public.v_schedules_monthly.id, 
        public.v_schedules_monthly.machine_nm, 
        public.v_schedules_monthly.itemcheck_nm, 
        public.v_schedules_monthly.method_check, 
        public.v_schedules_monthly.plan_check_dt,
        public.v_schedules_monthly.status_nm,
        public.v_tpm_history.actual_check_dt,
        public.v_tpm_history.checked_val,
        public.v_tpm_history.user_nm,
        public.v_tpm_history.status_nm,
        (
        SELECT COUNT(*) AS planned_count FROM public.v_schedules_monthly
        WHERE public.v_schedules_monthly.plan_check_dt BETWEEN '2024-06-01 00:00:00' AND '2024-06-30 23:59:59'
        ),
        (
        SELECT COUNT(*) AS done_count FROM public.v_tpm_history 
        WHERE public.v_tpm_history.status_nm = 'DONE'
        )
      FROM 
        public.v_schedules_monthly
      LEFT JOIN public.v_tpm_history ON public.v_schedules_monthly.itemcheck_id = public.v_tpm_history.itemcheck_id
      WHERE public.v_schedules_monthly.plan_check_dt BETWEEN '2024-06-01 00:00:00' AND '2024-06-30 23:59:59'
      ORDER BY public.v_schedules_monthly.plan_check_dt      
      `

      // let machine_q = `
      // SELECT COUNT(*) AS completed_count FROM public.tb_r_schedules
      // WHERE 
      // public.tb_r_schedules.plan_check_dt BETWEEN '2024-06-01 00:00:00' AND '2024-06-30 23:59:59'
      // AND public.tb_r_schedules.actual_check_dt IS NOT NULL
      //     `

      cons = (await queryCustom(machine_q)).rows

      // console.log(machine_q)

      response.success(res, "success to get completeness", cons);
    } catch (error) {
      // console.log(error);
      response.failed(res, 'Error to get data')
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