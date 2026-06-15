const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const systemCtrl = require("./controllers/systemController");

// ── Core Routes ──
const authRoutes = require("./routes/authRoutes");
const lookupRoutes = require("./routes/lookupRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const masterUserRoutes = require("./routes/tools/masterUserRoutes");
const masterUserFormRoutes = require("./routes/tools/masterUserFormRoutes");

// ── Master Routes ──
const costCenterRoutes = require("./routes/master/costCenterRoutes");
const accountRoutes = require("./routes/master/accountRoutes");
const kelompokRoutes = require("./routes/master/kelompokRoutes");
const jenisPembayaranRoutes = require("./routes/master/jenisPembayaranRoutes");

// ── Transaksi Routes ──
const uangMukaRoutes = require("./routes/transaksi/uangMukaRoutes");
const uangMukaFormRoutes = require("./routes/transaksi/uangMukaFormRoutes");
const uangMukaPenyelesaianRoutes = require("./routes/transaksi/uangMukaPenyelesaianRoutes");
const bkmRoutes = require("./routes/transaksi/bkmRoutes");
const bkmFormRoutes = require("./routes/transaksi/bkmFormRoutes");
const bkkRoutes = require("./routes/transaksi/bkkRoutes");
const bkkFormRoutes = require("./routes/transaksi/bkkFormRoutes");
const bbmRoutes = require("./routes/transaksi/bbmRoutes");
const bbmFormRoutes = require("./routes/transaksi/bbmFormRoutes");
const bbkRoutes = require("./routes/transaksi/bbkRoutes");
const bbkFormRoutes = require("./routes/transaksi/bbkFormRoutes");
const jurnalUmumRoutes = require("./routes/transaksi/jurnalUmumRoutes");
const jurnalUmumFormRoutes = require("./routes/transaksi/jurnalUmumFormRoutes");
const rekonsiliasiBankRoutes = require("./routes/transaksi/rekonsiliasiBankRoutes");
const pengajuanTransferRoutes = require("./routes/transaksi/pengajuanTransferRoutes");
const pengajuanTransferFormRoutes = require("./routes/transaksi/pengajuanTransferFormRoutes");
const terimaSetoranRoutes = require("./routes/transaksi/terimaSetoranRoutes");
const terimaSetoranFormRoutes = require("./routes/transaksi/terimaSetoranFormRoutes");
const voucherPembayaranRoutes = require("./routes/transaksi/voucherPembayaranRoutes");
const voucherPembayaranFormRoutes = require("./routes/transaksi/voucherPembayaranFormRoutes");
const mutasiOutRoutes = require("./routes/transaksi/mutasiOutRoutes");
const mutasiOutFormRoutes = require("./routes/transaksi/mutasiOutFormRoutes");

// ── Posting Routes ──
const pembayaranCustomerRoutes = require("./routes/posting/pembayaranCustomerRoutes");
const pembayaranCustomerFormRoutes = require("./routes/posting/pembayaranCustomerFormRoutes");
const pembayaranCustKaosanRoutes = require("./routes/posting/pembayaranCustKaosanRoutes");
const pembayaranCustKaosanFormRoutes = require("./routes/posting/pembayaranCustKaosanFormRoutes");

// ── Laporan Routes ──
const listJurnalRoutes = require("./routes/laporan/listJurnalRoutes");
const bukuBesarRoutes = require("./routes/laporan/bukuBesarRoutes");
const kasbonBelumSelesaiRoutes = require("./routes/laporan/kasbonBelumSelesaiRoutes");
const lapRekonsiliasiBankRoutes = require("./routes/laporan/rekonsiliasiBankRoutes");
const stokFinanceRoutes = require("./routes/laporan/stokFinanceRoutes");

const app = express();

// ── CORS ──
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      callback(null, origin); // echo back origin agar credentials bisa jalan
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// Endpoint untuk cek versi backend
app.get("/api/system/info", systemCtrl.getSystemInfo);

// ── Core Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/lookups", lookupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tools/master-user", masterUserRoutes);
app.use("/api/tools/master-user/form", masterUserFormRoutes);

// ── Master Routes ──
app.use("/api/master/cost-center", costCenterRoutes);
app.use("/api/master/account", accountRoutes);
app.use("/api/master/kelompok", kelompokRoutes);
app.use("/api/master/jenis-pembayaran", jenisPembayaranRoutes);

// ── Transaksi Routes ──
app.use("/api/transaksi/uang-muka", uangMukaRoutes);
app.use("/api/transaksi/uang-muka/form", uangMukaFormRoutes);
app.use("/api/transaksi/uang-muka/selesai", uangMukaPenyelesaianRoutes);
app.use("/api/transaksi/bkm", bkmRoutes);
app.use("/api/transaksi/bkm/form", bkmFormRoutes);
app.use("/api/transaksi/bkk", bkkRoutes);
app.use("/api/transaksi/bkk/form", bkkFormRoutes);
app.use("/api/transaksi/bbm", bbmRoutes);
app.use("/api/transaksi/bbm/form", bbmFormRoutes);
app.use("/api/transaksi/bbk", bbkRoutes);
app.use("/api/transaksi/bbk/form", bbkFormRoutes);
app.use("/api/transaksi/jurnal-umum", jurnalUmumRoutes);
app.use("/api/transaksi/jurnal-umum/form", jurnalUmumFormRoutes);
app.use("/api/transaksi/rekonsiliasi-bank", rekonsiliasiBankRoutes);
app.use("/api/transaksi/pengajuan-transfer", pengajuanTransferRoutes);
app.use("/api/transaksi/pengajuan-transfer/form", pengajuanTransferFormRoutes);
app.use("/api/transaksi/terima-setoran", terimaSetoranRoutes);
app.use("/api/transaksi/terima-setoran/form", terimaSetoranFormRoutes);
app.use("/api/transaksi/voucher-pembayaran", voucherPembayaranRoutes);
app.use("/api/transaksi/voucher-pembayaran/form", voucherPembayaranFormRoutes);
app.use("/api/transaksi/mutasi-out", mutasiOutRoutes);
app.use("/api/transaksi/mutasi-out/form", mutasiOutFormRoutes);

// ── Posting Routes ──
app.use("/api/posting/pembayaran-customer", pembayaranCustomerRoutes);
app.use("/api/posting/pembayaran-customer/form", pembayaranCustomerFormRoutes);
app.use("/api/posting/pembayaran-cust-kaosan", pembayaranCustKaosanRoutes);
app.use(
  "/api/posting/pembayaran-cust-kaosan/form",
  pembayaranCustKaosanFormRoutes,
);

// ── Laporan Routes ──
app.use("/api/laporan/list-jurnal", listJurnalRoutes);
app.use("/api/laporan/buku-besar", bukuBesarRoutes);
app.use("/api/laporan/kasbon-belum-selesai", kasbonBelumSelesaiRoutes);
app.use("/api/laporan/rekonsiliasi-bank", lapRekonsiliasiBankRoutes);
app.use("/api/laporan/stok-finance", stokFinanceRoutes);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Finance Backend is running",
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 3089;
app.listen(PORT, () => {
  console.log(`🚀 Server Finance running on port ${PORT}`);
});
