const express = require("express");
const router = express.Router();
const controller = require("../../controllers/laporan/biayaPerDivisiController");
const { verifyToken } = require("../../middleware/authMiddleware");

// Laporan — hanya verifyToken, tanpa menuId khusus (konsisten dengan
// laporan lain seperti Daftar Hutang)
router.get("/divisi", verifyToken, controller.getListDivisi);
router.get("/", verifyToken, controller.getBiayaPerDivisi);

module.exports = router;
