const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../../../config/catchAsynch");
const AppError = require("../../../config/AppError");

//***************GENERATE TOKEN********************//
const signToken = (id) => {
  return jwt.sign(id, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//***********************SEND RESPONSE*****************************************//
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.toJSON());

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  //remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

//*******************CREATE NEW USER *************************//
exports.create = catchAsync(async (req, res, next, Model) => {
  const newUser = await Model.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  res.status(200).json({
    status: "success",
    message: "Sign up successfully",
  });
});

//**********************LOGIN SESSIONS**************************//
exports.createSession = catchAsync(async (req, res, next, Model) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await Model.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect email/password", 401));
  }

  createSendToken(user, 200, req, res);
});

//*************LOGOUT THE USER**************//
exports.destroy = (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};
