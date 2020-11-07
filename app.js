const express = require("express");
const app = express();
const db = require("./config/mongoose");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./config/AppError");

app.use(globalErrorHandler);

module.exports = app;
