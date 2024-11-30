// producer.js
const amqp = require('amqplib');
// var amqp_1 = require('amqplib/callback_api');
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
let timestampDay = 24 * 60 * 60 * 1000;

const { client, ObjectId, database } = require('../bin/database');
const rmq_credential = {
    username: 'pm_modue',
    password: 'hl6GjO5LlRuQT1n',
    url: 'rmq2.pptik.id:5672',
    vhost: '/pm_module'
}
const rmq_url = `amqp://${rmq_credential.username}:${rmq_credential.password}@${rmq_credential.url}/${rmq_credential.vhost}`

// const rmq_url = `amqp://pm_modue:hl6GjO5LlRuQT1n@rmq2.pptik.id:5672/pm_module`

async function produceMessageOpenCV(msg) {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect(rmq_url);  // Replace with your RabbitMQ URL if different
        const channel = await connection.createChannel();

        // Declare a queue (it will be created if it doesn't exist)
        const queue = 'opencv_retrieve';
        await channel.assertQueue(queue, { durable: false });

        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(`Sent: ${msg}`);

        // Close the connection after a short delay
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);

    } catch (error) {
        console.error('Error in sending message:', error.message);
    }
}



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

        let data = {};

        // Declare the same queue that the producer is sending to
        const queue = 'opencv_status';
        await channel.assertQueue(queue, { durable: false });

        console.log(`Waiting for messages in ${queue} queue`);

        // Consume messages from the queue
        channel.consume(queue, (msg) => {
            if (msg) {
                data = msg.content.toString();
                console.log(data);
                produceMessageOpenCV(data);
                // response.success(res, "Success consume to rmq", data);
                console.log("Success consume to rmq");
                channel.ack(msg);  // Acknowledge the message after processing
            }
        });


    } catch (error) {
        console.error('Error in consumeMessageOpenCV:', error.message);
    }
}

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect', error.message)
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
            console.error('Error in consuming message:', error.message);
        }
    },

    consumeMessageOpenCV,
}
