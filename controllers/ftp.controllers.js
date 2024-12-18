const ftp = require("basic-ftp");
const fs = require("fs");
const { detect_objects_on_image, detect_faces_on_image } = require('./yolo.controllers');
const sharp = require('sharp');
const query = require("../helpers/queryMongo");


// ftp_client.ftp.verbose = true;

const ftp_dir = "/ftpparking/pm/raw/";

async function login_ftp() {
    ftp_client.access({
        host: process.env.FTP_SERVER,           // Replace with your FTP host (use the one from FileZilla)
        user: process.env.FTP_USERNAME,         // Replace with your FTP username (from FileZilla)
        password: process.env.FTP_PASSWORD,     // Replace with your FTP password (from FileZilla)
        port: process.env.FTP_PORT,
        secure: false                           // Set to `true` if using FTPS (secure FTP)
    })
}

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
            const ftp_client = new ftp.Client();
            const filename = msg;

            await ftp_client.access({
                host: process.env.FTP_SERVER,           // Replace with your FTP host (use the one from FileZilla)
                user: process.env.FTP_USERNAME,         // Replace with your FTP username (from FileZilla)
                password: process.env.FTP_PASSWORD,     // Replace with your FTP password (from FileZilla)
                port: process.env.FTP_PORT,
                secure: false                           // Set to `true` if using FTPS (secure FTP)
            })

            await ftp_client.downloadTo(('./uploads/raw/' + filename), (ftp_dir + filename))

            let imageBuffer = fs.readFileSync('./uploads/raw/' + filename);

            console.log()

            const boxes = await detect_objects_on_image(imageBuffer);
            const boxes2 = await detect_faces_on_image(imageBuffer);
            const svgContent = boxes.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');
            const svgContent_2 = boxes2.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');

            let flattenedArray = boxes.flat();
            let total_person = flattenedArray.filter(item => item === 'person').length;

            // console.log('count of person: ', total_person)

            let doc = {
                filename: filename,
                crated_by: filename.slice(0, 6),
                crated_dt: Date.now(),
                total_person: total_person,
            }

            await sharp(imageBuffer)
                .composite([{
                    input: Buffer.from(`
                                    <svg width="800" height="600">${svgContent}${svgContent_2}
                                    </svg>`),
                    blend: 'over'
                }])
                .toFile('./uploads/yolo/' + filename)
            fs.unlinkSync('./uploads/raw/' + filename, (err) => { if (err) throw (err); })

            await ftp_client.cd("/ftpparking/pm/result/");
            await ftp_client.uploadFrom('./uploads/yolo/' + filename, filename)

            fs.unlinkSync('./uploads/yolo/' + filename, (err) => { if (err) throw (err); })

            await query.queryPOST('cam_images', doc);

            console.log(boxes)
            console.log(boxes2)

            console.log(`Success processing image: `, filename);
            ftp_client.close();
        } catch (error) {
            // response.failed(res, `Failed to connect`, error)
            console.log(`Error processing image\n`, error);
        }
    },

    processImages2: (msg) => {
        try {
            const ftp_client = new ftp.Client();

            // doc ={
            //     filename: msg,
            //     crated_by: msg.slice(0, 6),
            //     crated_dt: Date.now(),
            //     person_detected: 0
            // }

            ftp_client.access({
                host: process.env.FTP_SERVER,           // Replace with your FTP host (use the one from FileZilla)
                user: process.env.FTP_USERNAME,         // Replace with your FTP username (from FileZilla)
                password: process.env.FTP_PASSWORD,     // Replace with your FTP password (from FileZilla)
                port: process.env.FTP_PORT,
                secure: false                           // Set to `true` if using FTPS (secure FTP)
            })

            ftp_client.downloadTo(('./uploads/raw/' + msg), (ftp_dir + msg))

            let imageBuffer = fs.readFileSync('./uploads/raw/' + msg);

            console.log()

            const boxes = detect_objects_on_image(imageBuffer);
            const boxes2 = detect_faces_on_image(imageBuffer);
            const svgContent = boxes.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');
            const svgContent_2 = boxes2.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');

            sharp(imageBuffer)
                .composite([{
                    input: Buffer.from(`
                                    <svg width="800" height="600">${svgContent}${svgContent_2}
                                    </svg>`),
                    blend: 'over'
                }])
                .toFile('./uploads/yolo/' + msg)
            fs.unlinkSync('./uploads/raw/' + msg, (err) => { if (err) throw (err); })

            ftp_client.cd("/ftpparking/pm/result/");
            ftp_client.uploadFrom('./uploads/yolo/' + msg, msg)

            fs.unlinkSync('./uploads/yolo/' + msg, (err) => { if (err) throw (err); })

            // await query.queryPOST('cam_images', )

            console.log(boxes)
            console.log(boxes2)

            console.log(`Success processing image`);
        } catch (error) {
            // response.failed(res, `Failed to connect`, error)
            console.log(`Error processing image\n`, error);
        }
    },

    login_ftp,
}