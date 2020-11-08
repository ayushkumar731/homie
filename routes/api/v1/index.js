const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/api/v1/authController");

router.use("/landlord", require("./landlord"));
router.use("/renter", require("./renter"));

module.exports = router;
