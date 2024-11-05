var express = require('express');

const { 
    uploadFiles,
    getListFiles,
    download,
} = require("../controllers/upload.controllers");
var router = express.Router();

router.post("/upload", uploadFiles);
router.get("/files", getListFiles);
router.get("/files/:name", download);

module.exports = router
