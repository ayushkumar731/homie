const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../../../config/catchAsync");
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
  user.role = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

//****************SET LANDLORD ROLE***************//
exports.setLandlordRole = (req, res, next) => {
  if (!req.body.role) {
    req.body.role = "landlord";
  }
  next();
};

//****************SET RENTER ROLE***************//
exports.setRenterRole = (req, res, next) => {
  if (!req.body.role) {
    req.body.role = "renter";
  }
  next();
};

//*******************CREATE NEW USER *************************//
exports.create = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  return res.status(200).json({
    status: "success",
    message: "resgisterd successfully",
  });
});

//**********************LOGIN SESSIONS**************************//
exports.createSession = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

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

//*******************CONTROL USER*********************//
exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!roles.includes(user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });
};
