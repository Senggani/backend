require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var routerV1 = require("./routes/index");
const { consumeMessageOpenCV } = require("./controllers/rmq.controllers");

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routerV1);

app.get("/", (req, res) => {
    res.send("connected");
});

consumeMessageOpenCV();

module.exports = app;

