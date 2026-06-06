const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/laporan/kasbonBelumSelesaiController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/default-account", verifyToken, ctrl.getDefaultAccount);
router.get("/search-account", verifyToken, ctrl.searchAccount);
router.get("/account/:kode", verifyToken, ctrl.getAccountByKode);
router.get("/", verifyToken, ctrl.getKasbonBelumSelesai);

module.exports = router;
