// primecss
const express = require("express");
const router = express.Router();

var layoutController = require("../controllers/layout");

// Publisher Home Route.
router.get("/", layoutController.getLayout);

module.exports = router;
