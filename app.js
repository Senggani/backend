require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const { connectToDatabase } = require("./bin/database")
const { consumeMessageOpenCV, login_ftp } = require("./controllers/rmq.controllers");

const dir = "./uploads"

const checkAndCreateDir = () => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('Upload directory created');
    }
};

var routerV1 = require("./routes/index");

var app = express();
app.use(cors());

connectToDatabase();
// login_ftp();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
checkAndCreateDir();
app.use("/uploads", (req, res, next) => {
    express.static(dir)(req, res, next);
});

app.use("/", routerV1);

app.get("/", (req, res) => {
    res.send("connected");
});

consumeMessageOpenCV();

module.exports = app;

