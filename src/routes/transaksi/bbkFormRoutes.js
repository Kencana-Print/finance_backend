const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/transaksi/bbkFormController");
const {
  verifyToken,
  checkPermission,
} = require("../../middleware/authMiddleware");

const menuId = 24;

router.get("/account", verifyToken, ctrl.getAccountOptions);
router.get("/account-all", verifyToken, ctrl.getAccountAll);
router.get("/keterangan", verifyToken, ctrl.getKeteranganOptions);
router.get("/cost-center", verifyToken, ctrl.getCostCenterOptions);
router.get("/dc/:cckode", verifyToken, ctrl.getDcOptions);
router.get("/supplier", verifyToken, ctrl.getSupplierOptions);
router.get(
  "/form/:nomor",
  verifyToken,
  checkPermission(menuId, "view"),
  ctrl.getDetailForm,
);
router.get(
  "/print/:nomor",
  verifyToken,
  checkPermission(menuId, "view"),
  ctrl.getPrintData,
);
router.post(
  "/save",
  verifyToken,
  checkPermission(menuId, "insert"),
  ctrl.saveData,
);

module.exports = router;
