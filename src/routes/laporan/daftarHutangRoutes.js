const express = require("express");
const router = express.Router();
const controller = require("../../controllers/laporan/daftarHutangController");
const { verifyToken } = require("../../middleware/authMiddleware");

// Laporan tidak punya menuId khusus — hanya verifyToken
router.get("/", verifyToken, controller.getBrowse);
router.get("/detail", verifyToken, controller.getDetail);

module.exports = router;
