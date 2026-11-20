const express = require("express");
const app = express();

app.use(require("./BackEnd"));

module.exports = app;
