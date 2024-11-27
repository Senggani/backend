const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

module.exports = {
    testConnection: async (req, res) => {
        try {
            console.log(1)
            response.success(res, `Successfully connected to backend`, req.body)
        } catch (error) {
            response.failed(res, `Failed to connect`, error)
        }
    },

    addUser: async (req, res) => {
        try {
            const data = req.body;
            let filter = { username: data.username }
            const username_is_taken = await query.queryGET(`user`, filter);

            if (username_is_taken) {
                response.failed(res, `username is taken.`)
            } else {

                let doc = {
                    username: data.username,
                    password: data.password,
                    role: data.role,
                    is_active: true,
                    created_dt: new Date()
                }

                const result = await query.queryPOST(`user`, doc);
                response.success(res, `Success adding new user.`, result)
            }
        } catch (error) {
            response.failed(res, `Failed to connect.`, error)
        }
    },

    // editUser: async (req, res) => {
    //     try {
    //         console.log(1)
    //         response.success(res, `Successfully connected to backend`, req.body)
    //     } catch (error) {
    //         response.failed(res, `Failed to connect`, error)
    //     }
    // },
}