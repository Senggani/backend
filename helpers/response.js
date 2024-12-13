const fs = require('fs');
const path = require('path');

// const filePathToStream ();

const notAllowed = (res, message) => {
    let response = {
        status: 401,
        message: message
    }
    res.status(401).json(response)
}
const success = (res, message = 'Success', data, meta) => {
    let response = {
        status: 200,
        message: message,
        data: data,
        meta: meta
    }
    res.status(200).json(response)
}
// const sendFile = (res, filePath, message = 'Success', data, meta) => {
//     let response = {
//         status: 200,
//         message: message,
//         data: data,
//         meta: meta
//     }
//     res.status(200)
//     const imageStream = fs.createReadStream(filePath);

//     // Set the Content-Type to multipart/form-data with boundary
//     res.setHeader('Content-Type', 'multipart/form-data; boundary=--boundary');

//     // Start the multipart response
//     res.write('--boundary\r\n');
//     res.write('Content-Disposition: form-data; name="json"\r\n');
//     res.write('Content-Type: application/json\r\n\r\n');

//     // Send the JSON data
//     res.write(JSON.stringify(response));
//     res.write('\r\n');

//     // Send the image as a separate part in the response
//     res.write('--boundary\r\n');
//     res.write(`Content-Disposition: form-data; name="image"; filename="${filePath}"\r\n`);
//     res.write('Content-Type: image/jpeg\r\n\r\n');

//     imageStream.pipe(res, { end: false });  // Pipe the image to the response

//     imageStream.on('end', () => {
//         res.write('\r\n');
//         res.write('--boundary--');  // End the multipart response
//         res.end();
//     });
// }
// const sendFileAsJSON = (res, filePath, message = 'Success', data, meta) => {
//     let file = [];
//     for (let index = 0; index < filePath.length; index++) {
//         let imageStream = fs.readFileSync(filePath[index]);
//         file[index] = imageStream.toString('base64');
//     }
//     let response = {
//         status: 200,
//         message: message,
//         data: data,
//         file: file,
//         meta: meta
//     }
//     res.status(200).json(response)
// }
// const sendMultipleFile = async (res, filePath, message = 'Success', data, meta) => {
//     try {
//         let response = {
//             status: 200,
//             message: message,
//             data: data,
//             meta: meta
//         }
//         res.status(200)

//         res.setHeader('Content-Type', 'multipart/form-data; boundary=--boundary');

//         res.write('--boundary');
//         res.write('Content-Disposition: form-data; Content-Type: application/json; ');
//         res.write('data: ');

//         res.write(JSON.stringify(response));
//         // res.write('');

//         for (let index = 0; index < filePath.length; index++) {

//             // res.write('');
//             res.write('--boundary');
//             res.write(`Content-Disposition: form-data; Content-Type: image/jpeg; filename: "${filePath[index]}"; `);
//             res.write('data: ');

//             let imageStream = fs.readFileSync(filePath[index]);
//             res.write(imageStream.toString('base64'))
//         }

//         res.write('--boundary--');
//         res.end();
//     } catch (error) {
//         response.failed(res, `Failed to connect`, error.message)
//         console.log(error.message)
//     }
// }
const error = (res, message) => {
    let response = {
        status: 500,
        message: message
    }
    res.status(500).json(response)
}
const noContent = (res) => {
    res.status(204)
}
const notFound = (res, message) => {
    let response = {
        status: 404,
        message: message
    }
    res.status(404).json(response)
}
const failed = (res, message, error) => {
    let response = {
        status: 400,
        message: message,
        error: error
    }
    res.status(400).json(response)
}
const badRequest = (res, message = "Bad Request") => {
    return res.status(400).json({
        status: 400,
        message,
    });
}

const unauthorized = (res, message = "Unauthorized") => {
    return res.status(401).json({
        status: 401,
        message,
    });
}

module.exports = {
    success,
    error,
    noContent,
    notFound,
    failed,
    notAllowed,
    badRequest,
    unauthorized,
    // sendFile,
    // sendMultipleFile,
    // sendFileAsJSON
}