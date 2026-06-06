const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/laporan/stokFinanceController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/cabang", verifyToken, ctrl.getCabangList);
router.get("/", verifyToken, ctrl.getStokFinance);

module.exports = router;
