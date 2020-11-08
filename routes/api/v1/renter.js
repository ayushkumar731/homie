const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/api/v1/authController");

router.post(
  "/login",
  authController.restrictTo("renter"),
  authController.createSession
);

router.post("/register", authController.setRenterRole, authController.create);

module.exports = router;
