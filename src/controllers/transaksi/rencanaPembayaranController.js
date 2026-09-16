const service = require("../../services/transaksi/rencanaPembayaranService");

const getBrowse = async (req, res) => {
  try {
    const { startDate, endDate, supKode } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({
        success: false,
        message: "startDate dan endDate wajib diisi.",
      });

    const data = await service.getBrowse(startDate, endDate, supKode);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getBrowseDetail = async (req, res) => {
  try {
    const { startDate, endDate, supKode } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({
        success: false,
        message: "startDate dan endDate wajib diisi.",
      });

    const data = await service.getBrowseDetail(startDate, endDate, supKode);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const saveRencana = async (req, res) => {
  try {
    const userKode = req.user?.kode || "ADMIN";
    const data = await service.saveRencana(req.body, userKode);
    res.json({
      success: true,
      message: "Rencana pembayaran berhasil disimpan.",
      data,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

module.exports = {
  getBrowse,
  getBrowseDetail,
  saveRencana,
};
