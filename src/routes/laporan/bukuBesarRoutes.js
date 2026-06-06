const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/laporan/bukuBesarController");
const { verifyToken } = require("../../middleware/authMiddleware");

// Tidak ada MENU_ID — cukup verifyToken
router.get("/default-account", verifyToken, ctrl.getDefaultAccount);
router.get("/search-account", verifyToken, ctrl.searchAccount);
router.get("/account/:kode", verifyToken, ctrl.getAccountByKode);
router.get("/", verifyToken, ctrl.getBukuBesar);

module.exports = router;
