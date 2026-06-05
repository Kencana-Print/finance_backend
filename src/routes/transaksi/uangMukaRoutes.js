const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/transaksi/uangMukaController");
const {
  verifyToken,
  checkPermission,
} = require("../../middleware/authMiddleware");

const menuId = 21;

router.get("/", verifyToken, checkPermission(menuId, "view"), ctrl.getBrowse);
router.delete(
  "/:nomor",
  verifyToken,
  checkPermission(menuId, "delete"),
  ctrl.deleteData,
);

module.exports = router;
