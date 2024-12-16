const ftp = require("basic-ftp");
const fs = require("fs");
const { detect_objects_on_image, detect_faces_on_image } = require('./yolo.controllers');
const sharp = require('sharp');
const { buffer } = require("stream/consumers");
const stream = require('stream');
// const { downloadTo } = require("basic-ftp/dist/transfer");


const ftp_client = new ftp.Client();
// ftp_client.ftp.verbose = true;

const ftp_dir = "/ftpparking/pm/raw/";

// await client.access({
//     host: "ftp.example.com",       // Replace with your FTP host (use the one from FileZilla)
//     user: "your-username",         // Replace with your FTP username (from FileZilla)
//     password: "your-password",     // Replace with your FTP password (from FileZilla)
//     secure: false                  // Set to `true` if using FTPS (secure FTP)
//   });

// async function downloadImageToBuffer(client, remoteFilePath) {
//     return new Promise((resolve, reject) => {
//         const chunks = [];

//         // Download the file to the chunks array
//         client.downloadTo(chunks, remoteFilePath)
//             .then(() => {
//                 // Concatenate the chunks into a single Buffer
//                 resolve(Buffer.concat(chunks));
//             })
//             .catch(reject); // Reject if there's an error
//     });
// }

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, `Successfully connected to backend`)
        } catch (error) {
            response.failed(res, `Failed to connect`, error)
        }
    },

    processImages: async (msg) => {
        try {
            console.log('msg on processImages: ', msg)

            await ftp_client.access({
                host: process.env.FTP_SERVER,           // Replace with your FTP host (use the one from FileZilla)
                user: process.env.FTP_USERNAME,         // Replace with your FTP username (from FileZilla)
                password: process.env.FTP_PASSWORD,     // Replace with your FTP password (from FileZilla)
                port: process.env.FTP_PORT,
                secure: false                           // Set to `true` if using FTPS (secure FTP)
            });

            // await ftp_client.connect({
            //     host: process.env.FTP_SERVER,           // Replace with your FTP host (use the one from FileZilla)
            //     user: process.env.FTP_USERNAME,         // Replace with your FTP username (from FileZilla)
            //     password: process.env.FTP_PASSWORD,     // Replace with your FTP password (from FileZilla)
            //     port: process.env.FTP_PORT,
            //     secure: false                           // Set to `true` if using FTPS (secure FTP)
            // });

            // let imageBuffer;
            // console.log(ftp_client.size((ftp_dir + msg)))

            // await ftp_client.on('ready', function () {
            //     console.log(ftp_client.size((ftp_dir + msg)))
            //     ftp_client.get((ftp_dir + msg), function (err, stream) {
            //         if (err) throw err;
            //         stream.once('close', function () { ftp_client.end(); });
            //         stream.pipe(writableStream);
            //     })
            // })

            // Create a writable stream that collects the data into a buffer
            const writableStream = new stream.Writable({
                write(chunk, encoding, callback) {
                    // Store the chunks in an array
                    this.buffer.push(chunk);
                    callback();
                },
                final(callback) {
                    // Once the stream ends, concatenate the array into a single buffer
                    const finalBuffer = Buffer.concat(this.buffer);
                    console.log('Final Buffer:', finalBuffer);

                    // Optionally do something with finalBuffer (e.g., save it, process it)
                    callback();
                },
                construct() {
                    this.buffer = [];  // Initialize the buffer array
                }
            });

            // console.log(writableStream)

            await ftp_client.downloadTo(writableStream, (ftp_dir + msg))

            //             let imageBuffer = await fs.readFileSync('./uploads/ESP_temp.jpg');

            //             const boxes = await detect_objects_on_image(imageBuffer);
            //             const boxes2 = await detect_faces_on_image(imageBuffer);
            //             const svgContent = boxes.map(box => `
            // <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            // <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            // <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');
            //             const svgContent_2 = boxes2.map(box => `
            // <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            // <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            // <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');

            //             await sharp(imageBuffer)
            //                 .composite([{
            //                     input: Buffer.from(`
            //                         <svg width="800" height="600">${svgContent}${svgContent_2}
            //                         </svg>`),
            //                     blend: 'over'
            //                 }])
            //                 .toFile('./uploads/ESP_temp.jpg')

            //             await ftp_client.cd("/ftpparking/pm/result/");
            //             await ftp_client.uploadFrom('./uploads/ESP_temp.jpg', msg);
            console.log(`Success processing image`);
        } catch (error) {
            // response.failed(res, `Failed to connect`, error)
            console.log(`Error processing image`, error);
        }
    },
}