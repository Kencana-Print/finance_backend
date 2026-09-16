const express = require("express");
const router = express.Router();
const controller = require("../../controllers/transaksi/rencanaPembayaranController");
const {
  verifyToken,
  checkPermission,
} = require("../../middleware/authMiddleware");

const MENU_ID = 32;

router.get(
  "/",
  verifyToken,
  checkPermission(MENU_ID, "view"),
  controller.getBrowse,
);
router.get(
  "/detail",
  verifyToken,
  checkPermission(MENU_ID, "view"),
  controller.getBrowseDetail,
);
router.post(
  "/",
  verifyToken,
  checkPermission(MENU_ID, "edit"),
  controller.saveRencana,
);

module.exports = router;
