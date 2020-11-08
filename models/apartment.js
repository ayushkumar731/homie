const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApartmentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "apartment must belongs to the user"],
    },
    address: {
      type: String,
      required: [true, "please provide address"],
    },
    city: {
      type: String,
      required: [true, "please provide city"],
    },
    state: {
      type: String,
      required: [true, "Please provide state"],
    },
    price: {
      type: String,
      required: [true, "please provide price"],
    },
    bhk: {
      type: String,
      required: [true, "please provide bhk"],
    },
    photo: {
      type: String,
      required: [true, "please provide picture"],
    },
  },
  {
    timestamps: true,
  }
);

const apartment = mongoose.model("Apartment", ApartmentSchema);
module.exports = apartment;
