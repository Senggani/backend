require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const { connectToDatabase } = require("./bin/database")

const dir = "./resources"

const checkAndCreateDir = () => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('Upload directory created');
    }
};

var routerV1 = require("./routes/index");
const { consumeMessageOpenCV } = require("./controllers/rmq.controllers");

var app = express();
app.use(cors());

connectToDatabase();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
checkAndCreateDir();
app.use(express.static(dir));

app.use("/", routerV1);

app.get("/", (req, res) => {
    res.send("connected");
});

consumeMessageOpenCV();

module.exports = app;

