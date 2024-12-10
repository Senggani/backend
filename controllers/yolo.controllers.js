const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");
const multer = require("multer")
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const ort = require("onnxruntime-node");

const uploadDir = './upload/yolo/';

const pixelSize = 640;

const checkAndCreateDir = (req, res, next) => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        // console.log('Upload directory created');
    }
    next();
};

const upload = multer();

async function detect_objects_on_image(buf) {
    // console.log('detect_objects_on_image')
    const [input, img_width, img_height] = await prepare_input(buf);
    const output = await run_model(input);
    return process_output(output, img_width, img_height);
}

async function prepare_input(buf) {
    // console.log('prepare_input')
    const img = sharp(buf);
    const md = await img.metadata();
    const [img_width, img_height] = [md.width, md.height];
    const pixels = await img.removeAlpha()
        .resize({ width: pixelSize, height: pixelSize, fit: 'fill' })
        .raw()
        .toBuffer();
    const red = [], green = [], blue = [];
    for (let index = 0; index < pixels.length; index += 3) {
        red.push(pixels[index] / 255.0);
        green.push(pixels[index + 1] / 255.0);
        blue.push(pixels[index + 2] / 255.0);
    }
    const input = [...red, ...green, ...blue];
    return [input, img_width, img_height];
}

async function run_model(input) {
    // console.log('run_model')
    const model = await ort.InferenceSession.create("best_local.onnx");
    // console.log('2')
    input = new ort.Tensor(Float32Array.from(input), [1, 3, pixelSize, pixelSize]);
    // console.log('3')
    const outputs = await model.run({ images: input });
    // console.log('4')
    return outputs["output0"].data;
}

function process_output(output, img_width, img_height) {
    // console.log('process_output')
    let boxes = [];
    for (let index = 0; index < 8400; index++) {
        const [class_id, prob] = [...Array(80).keys()]
            .map(col => [col, output[8400 * (col + 4) + index]])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
        if (prob < 0.5) {
            continue;
        }
        const label = yolo_classes[class_id];
        const xc = output[index];
        const yc = output[8400 + index];
        const w = output[2 * 8400 + index];
        const h = output[3 * 8400 + index];
        const x1 = (xc - w / 2) / pixelSize * img_width;
        const y1 = (yc - h / 2) / pixelSize * img_height;
        const x2 = (xc + w / 2) / pixelSize * img_width;
        const y2 = (yc + h / 2) / pixelSize * img_height;
        boxes.push([x1, y1, x2, y2, label, prob]);
    }

    boxes = boxes.sort((box1, box2) => box2[5] - box1[5])
    const result = [];
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < 0.7);
    }
    return result;
}

function iou(box1, box2) {
    // console.log('iou')
    return intersection(box1, box2) / union(box1, box2);
}

function union(box1, box2) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1)
    const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1)
    return box1_area + box2_area - intersection(box1, box2)
}

function intersection(box1, box2) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const x1 = Math.max(box1_x1, box2_x1);
    const y1 = Math.max(box1_y1, box2_y1);
    const x2 = Math.min(box1_x2, box2_x2);
    const y2 = Math.min(box1_y2, box2_y2);
    return (x2 - x1) * (y2 - y1)
}

const yolo_classes = [
    // 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    // 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse',
    // 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
    // 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard',
    // 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    // 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
    // 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
    // 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
    'Gani'
];


module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, `Successfully connected to backend`, req.body)

        } catch (error) {
            response.failed(res, `Failed to connect`, error.message)
        }
    },

    detectObject: async (req, res) => {
        try {

            console.log(req.file)
            const filename = Date.now() + '_' + req.file.originalname;
            const rawFileName = 'raw_' + filename;
            fs.writeFileSync(uploadDir + rawFileName, req.file.buffer);

            const boxes = await detect_objects_on_image(req.file.buffer);
            const svgContent = boxes.map(box => `
            <rect x="${parseInt(box[0])}" y="${parseInt(box[1])}" width="${parseInt(box[2] - box[0])}" height="${parseInt(box[3] - box[1])}" fill="none" stroke="red" stroke-width="20" stroke-opacity="0.7"/>
            <rect x="${parseInt(box[0])}" y="${parseInt(box[3]) - 60}" width="${parseInt(box[2] - box[0])}" height="50" fill="white" fill-opacity="0.7" />
            <text x="${parseInt(box[0]) + 20}" y="${parseInt(box[3]) - 20}" font-size="50" fill="green" font-family="Arial">${box[4]}: 0.${parseInt(box[5] * 1000)}%</text>`).join('');

            const metadata = await sharp(uploadDir + rawFileName).metadata()

            await sharp(uploadDir + rawFileName)
                .composite([{
                    input: Buffer.from(`
            <svg width="${metadata.width}" height="${metadata.height}">${svgContent}
            </svg>`),
                    blend: 'over'
                }])
                .toFile(uploadDir + filename)

            // fs.unlinkSync(uploadDir + rawFileName);

            response.success(res, `Success to connect`, boxes);

        } catch (error) {
            response.failed(res, `Failed to connect`, error)
        }
    },

    upload,
    checkAndCreateDir,
    detect_objects_on_image,
}