const svc = require("../../services/transaksi/uangMukaService");

const getBrowse = async (req, res) => {
  try {
    const { startDate, endDate, cabang } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({
        success: false,
        message: "startDate dan endDate wajib diisi.",
      });

    const data = await svc.getBrowse(startDate, endDate, cabang || "ALL");
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const deleteData = async (req, res) => {
  try {
    await svc.deleteData(req.params.nomor, req.user.cabang);
    res.json({ success: true, message: "Berhasil dihapus." });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const getBrowsePendingAll = async (req, res) => {
  try {
    const data = await svc.getBrowsePendingAll();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateStatusFinance = async (req, res) => {
  try {
    const { status } = req.body;
    await svc.updateStatusFinance(req.params.nomor, status);
    res
      .status(200)
      .json({ success: true, message: "Status berhasil diperbarui." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBrowse,
  deleteData,
  getBrowsePendingAll,
  updateStatusFinance,
};
