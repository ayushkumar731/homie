const AppError = require("./../config/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleMongoErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(.*?[^\\])\1/)[0];
  message = `User Allready Exist`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  message = `Invalid input data ${error.join(", ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token !, Please login again", 401);

const handleTokenExpiredError = () =>
  new AppError("Token expired!, Please login again", 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.includes("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //RENDER WEBSITE
  console.error("Error", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.includes("/api")) {
    //operational trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //programming or another unknown error: don't leak error detail
    console.error("Error", err);
    return res.status(500).json({
      status: "ERROR",
      message: "Something went wrong",
    });
  }

  //RENDER WEBSITE
  //operational trusted error: send message to client

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  //programming or another unknown error: don't leak error detail
  console.error("Error", err);

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV == "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV == "production") {
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code == 11000) err = handleMongoErrorDB(err);
    if (err.name == "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();

    sendErrorProd(err, req, res);
  }
};
