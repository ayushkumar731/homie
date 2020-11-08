const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/api/v1/authController");

router.post(
  "/login",
  authController.restrictTo("landlord"),
  authController.createSession
);

router.post("/register", authController.setLandlordRole, authController.create);

module.exports = router;
