const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/laporan/rekonsiliasiBankController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/", verifyToken, ctrl.getRekonsiliasi);

module.exports = router;
