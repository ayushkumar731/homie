const multer = require("multer");
const sharp = require("sharp");
const User = require("../../../models/user");
const Apartment = require("../../../models/apartment");
const catchAsync = require("../../../config/catchAsync");
const AppError = require("../../../config/AppError");
const apartment = require("../../../models/apartment");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//***************MULTER*********************************//
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload Image!", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadApartmentImage = upload.single("photo");

//RESIZE IMAGES
exports.resizeApartmentImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `apartment-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(640, 320)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`assets/img/apartment/${req.file.filename}`);

  next();
});

//******************CREATE DOC DATA*********************//

exports.createPost = catchAsync(async (req, res, next) => {
  const filterBody = filterObj(
    req.body,
    "address",
    "user",
    "city",
    "state",
    "price",
    "bhk"
  );
  if (req.file) filterBody.photo = req.file.filename;
  const newPost = await Apartment.create(filterBody);

  return res.status(200).json({
    status: "success",
    newPost,
  });
});

//********************UPDATE DOC************************//

exports.updatePost = catchAsync(async (req, res, next) => {
  const apartment = await Apartment.findById(req.params.id);

  //IF POST NOT FOUND WITH THAT ID
  if (!apartment) {
    return next(new AppError("No doc found with this id", 404));
  }

  if (apartment.user.id != req.user.id) {
    return next(
      new AppError("You do not have permission to perform this action", 404)
    );
  }

  if (req.file) {
    if (apartment.photo) {
      fs.unlinkSync(
        path.join(__dirname, "../../../assets/img/apartment", apartment.photo)
      );
    }
  }

  const filterBody = filterObj(
    req.body,
    "address",
    "user",
    "city",
    "state",
    "price",
    "bhk"
  );

  if (req.file) filterBody.photo = req.file.filename;

  // IF RELATED THEN UPDATE DOC
  const updatedDoc = await Model.findByIdAndUpdate(req.params.id, filterBody, {
    new: true,
    runValidators: true,
  });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: updatedDoc,
  });
});
//**********************DELETE DOC************************//

exports.deletePost = catchAsync(async (req, res, next) => {
  // FIND POST
  const apartment = await Apartment.findById(req.params.id);

  //IF POST ARE NOT RELATED WITH THE ID
  if (!apartment) {
    return next(new AppError("No doc found with that id", 404));
  }

  //IF POST ARE NOT RELATED WITH THE CURRENT USER THEN THROW AN ERROR
  if (apartment.user.id != req.user.id) {
    return next(
      new AppError("You do have permission to perform this action", 404)
    );
  }

  if (apartment.photo) {
    fs.unlinkSync(
      path.join(__dirname, "../../../assets/img/apartment", apartment.photo)
    );
  }

  //DELETE POST
  const deleteDoc = await Apartment.findByIdAndDelete(req.params.id);

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    message: "Your message has been deleted successfully",
  });
});

//********************GET ALL POSTS BY USER ID******************//
exports.getAllDocsByUser = (Model) =>
  catchAsync(async (req, res, next) => {
    //FIND DOC
    const doc = await apartment.find({ user: req.params.id });

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });
