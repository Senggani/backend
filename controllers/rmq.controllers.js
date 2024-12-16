const amqp = require('amqplib');
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
let timestampDay = 24 * 60 * 60 * 1000;
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { client, ObjectId, database } = require('../bin/database');
const { detect_objects_on_image, detect_faces_on_image } = require('./yolo.controllers');
const { processImages } = require('./ftp.controllers')
const sharp = require('sharp');
require("dotenv").config();

const uploadDir = './uploads/opencv/';
const uploadDirEsp32 = './uploads/esp32';
const status_queue = 'test_ESP32';
const upload_queue = 'upload_queue';

const checkAndCreateDir = (req, res, next) => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Upload directory created');
    }
    next();
};
const dirEsp32 = () => {
    if (!fs.existsSync(uploadDirEsp32)) {
        fs.mkdirSync(uploadDirEsp32, { recursive: true });
        console.log('Upload directory created');
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({ storage });

const rmq_credential = {
    username: process.env.RMQ_USERNAME,
    password: process.env.RMQ_PASSWORD,
    url: process.env.RMQ_URL,
    vhost: process.env.RMQ_VHOST
}
const rmq_url = `amqp://${rmq_credential.username}:${rmq_credential.password}@${rmq_credential.url}/${rmq_credential.vhost}`

async function produceMessageOpenCV(msg) {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect(rmq_url);  // Replace with your RabbitMQ URL if different
        const channel = await connection.createChannel();

        // Declare a queue (it will be created if it doesn't exist)
        await channel.assertQueue(upload_queue, { durable: false });

        channel.sendToQueue(upload_queue, Buffer.from(msg));

        console.log(`Sent: ${msg}`);

        // Close the connection after a short delay
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);

    } catch (error) {
        console.error('Error in sending message:', error);
    }
}

// async function consumeMessageOpenCV(req, res) {
//     try {
//         // Connect to RabbitMQ server
//         const connection = await amqp.connect(rmq_url);
//         connection.on('close', () => {
//             console.log('Connection closed. Attempting to reconnect...');
//             setTimeout(consumeMessageOpenCV, 5000); // Retry after a delay
//         });

//         connection.on('error', (err) => {
//             console.error('Connection error:', err);
//         });
//         const channel = await connection.createChannel();

//         let data = {};

//         // Declare the same queue that the producer is sending to
//         await channel.assertQueue(status_queue, { durable: false });

//         console.log(`Waiting for messages in ${status_queue} queue`);

//         // Consume messages from the queue
//         channel.consume(status_queue, (msg) => {
//             if (msg) {
//                 data = msg.content.toString();
//                 console.log(data);
//                 // produceMessageOpenCV(data);
//                 // response.success(res, "Success consume to rmq", data);
//                 console.log("Success consume to rmq");
//                 channel.ack(msg);  // Acknowledge the message after processing
//             }
//         });


//     } catch (error) {
//         console.error('Error in consumeMessageOpenCV:', error);
//     }
// }

async function consumeMessageOpenCV(req, res) {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect(rmq_url);
        connection.on('close', () => {
            console.log('Connection closed. Attempting to reconnect...');
            setTimeout(consumeMessageOpenCV, 5000); // Retry after a delay
        });

        connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
        const channel = await connection.createChannel();

        let data;

        // Declare the same queue that the producer is sending to
        await channel.assertQueue(status_queue, { durable: false });

        console.log(`Waiting for messages in ${status_queue} queue`);

        // Consume messages from the queue
        channel.consume(status_queue, async (msg) => {
            if (msg) {
                data = msg.content.toString();
                console.log('data in if: ', data);
                console.log("Success consume to rmq");
                // channel.ack(msg);  // Acknowledge the message after processing

                try {
                    // Process the image after receiving the message
                    await processImages(data);
                    console.log('Success to processImages', data);

                    // Acknowledge the message after processing
                    channel.ack(msg);
                } catch (err) {
                    console.error('Error processing image:', err);
                    // Optionally, nack (negatively acknowledge) the message if processing fails
                    channel.nack(msg);
                }
            }
        });

    } catch (error) {
        console.error('Error in consumeMessageOpenCV:', error);
    }
}

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect', error)
        }
    },

    sendMessage: async (req, res) => {
        try {
            // Connect to RabbitMQ server
            const connection = await amqp.connect('amqp://localhost:5672');  // Replace with your RabbitMQ URL if different
            const channel = await connection.createChannel();

            // Declare a queue (it will be created if it doesn't exist)
            const queue = 'test_queue';
            await channel.assertQueue(queue, { durable: false });

            // Send a message to the queue
            const message = {
                itemcheck_nm: "Cek arus",
                std: "value",
                min: 3.3,
                max: 3.7,
                period: "A",
                part_nm: "actuator",
                part_id: "6730acfdd298ab0e6c2562a2",
                machine_id: "673097e6d6b105194b0da276"
            };

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

            console.log(`Sent: ${message}`);

            // Close the connection after a short delay
            setTimeout(() => {
                channel.close();
                connection.close();
            }, 500);

            response.success(res, "Success produce to rmq")

        } catch (error) {
            console.error('Error in sending message:', error);
        }
    },

    consumeMessage: async (req, res) => {
        try {
            // Connect to RabbitMQ server
            const connection = await amqp.connect('amqp://localhost:5672');
            const channel = await connection.createChannel();

            let data = {};

            // Declare the same queue that the producer is sending to
            const queue = 'test_queue';
            await channel.assertQueue(queue, { durable: false });

            console.log('Waiting for messages...');

            // Consume messages from the queue
            channel.consume(queue, (msg) => {
                if (msg) {
                    data = JSON.parse(msg.content.toString());
                    response.success(res, "Success consume to rmq", data);
                    query.queryPOST("pm_module", "rmq_test", data);
                    console.log(`Received: ${data.itemcheck_nm}`);
                    channel.ack(msg);  // Acknowledge the message after processing
                }
            });


        } catch (error) {
            console.error('Error in consuming message:', error);
        }
    },

    uploadOpencvImage: async (req, res) => {
        try {
            const data = req.body;

            const file = req.file;

            let results = {};

            let doc = {
                created_by: data.source,
                created_dt: new Date(),
                total_person: data.total_person,
                location: data.location,
                filename: file.filename,
                filepath: uploadDir,
                contentType: req.file.mimetype,
            };

            console.log(data)

            results = await query.queryPOST("opencv_image", doc);

            response.success(res, "Success uploading to backend", results);
        } catch (error) {
            response.failed(res, "Failed uploading to backend", error);
        }
    },

    downloadOpencvImage: async (req, res) => {
        try {
            const data = req.query;
            let filter = {}
            if (data.id) {
                filter = { _id: new ObjectId(`${data.id}`) }
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

            let results = await query.queryTS("opencv_image", filter, {}, (data.limit ? parseInt(data.limit) : 100))

            const filePath = path.join(__dirname, `.${uploadDir}${results[0].filename}`);

            if (!fs.existsSync(filePath)) {
                return res.status(404).send("File not found");
            }
            response.success(res, `Success to list opencv image`, results)
        } catch (error) {
            response.failed(res, "Failed downloading image", error);
        }
    },

    uploadESP32Image: async (req, res) => {
        try {
            // console.log('ok');
            const data = req.body;
            // console.log(data.body);
            const buffer = Buffer.from(data.image, 'base64');
            // const buffer = Buffer.from(data.image);
            console.log(buffer);
            dirEsp32();
            // console.log('ok');
            const filePath = uploadDirEsp32 + data.filename;
            console.log(filePath);
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.log('Error saving image:', err);
                }
            });
            // console.log('ok');

            // console.log(data)

            response.success(res, "Success getting data to backend", data.filename);
        } catch (error) {
            response.failed(res, "Failed uploading to backend", error);
        }
    },

    uploadESP32ImageYolo: async (req, res) => {
        try {
            const data = req.body;

            const filename = '/' + Date.now() + '_' + data.filename.replace(/\//g, '');

            const buffer = Buffer.from(data.image, 'base64');

            const boxes = await detect_objects_on_image(buffer);
            const boxes2 = await detect_faces_on_image(buffer);
            const svgContent = boxes.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');
            const svgContent_2 = boxes2.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');

            dirEsp32();

            await sharp(buffer)
                .composite([{
                    input: Buffer.from(`
            <svg width="${data.width}" height="${data.height}">${svgContent}${svgContent_2}
            </svg>`),
                    blend: 'over'
                }])
                .toFile(uploadDirEsp32 + filename)

            response.success(res, "Success getting data to backend", data.filename);
        } catch (error) {
            response.failed(res, "Failed uploading to backend", error);
            console.log(error)
        }
    },

    consumeMessageOpenCV,
    checkAndCreateDir,
    upload
}
