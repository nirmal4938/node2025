const express = require("express");
const router = express.Router();

var konvaController = require("../controllers/konva");

// Publisher Home Route.
router.get("/", konvaController.getKonvaPage);

module.exports = router;
