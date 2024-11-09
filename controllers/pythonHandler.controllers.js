const fs = require('fs');

const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
} = require("../helpers/queryMongo");
const { exec, spawn } = require('child_process');
const { stdout } = require('process');
const command = 'python ./python/script.py satu_dua tiga_empat'
const pyPath = './python/detectFace.py'

module.exports = {
    testConnection: async (req, res) => {
        try {
            let data;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    return;
                }

                if (stderr) {
                    console.error(`Python Error: ${stderr}`);
                    return;
                }

                console.log(`Python Output: ${stdout}`);

                data = stdout;
            });

            response.success(res, "Successfully connected to backend", data)

        } catch (error) {
            response.failed(res, 'Failed to connect')
        }
    },

    detectFace: async (req, res) => {
        try {
            // const pythonProcess = exec('python' [pyPath]);

            // const imageBuffer = req.file.buffer;

            // pythonProcess.stdin.write(imageBuffer);
            // pythonProcess.stdin.end();

            // pythonProcess.on('close', (code) => {
            //     console.log(`Python script finished with exit code: ${code}`);
            // });

        }
        catch (error) {

        }
    }
}