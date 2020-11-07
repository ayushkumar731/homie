const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const RenterSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "please provide email id"],
    },
    name: {
      type: String,
      required: [true, "please provide name"],
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, "please provide password"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "please provide confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "password and confirm password are not same",
      },
    },
    role: {
      type: String,
      default: "renter",
      enum: ["renter"],
    },
  },
  {
    timestamps: true,
  }
);

RenterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

RenterSchema.methods.checkPassword = async function (formPass, userPass) {
  return await bcrypt.compare(formPass, userPass);
};

const renter = mongoose.model("Renter", RenterSchema);
module.exports = renter;
