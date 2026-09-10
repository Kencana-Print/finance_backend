const svc = require("../../services/laporan/biayaPerDivisiService");

const getListDivisi = async (req, res) => {
  try {
    const data = await svc.getListDivisi();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getBiayaPerDivisi = async (req, res) => {
  try {
    const { cckode, startDate, endDate } = req.query;
    if (!cckode || !startDate || !endDate)
      return res.status(400).json({
        success: false,
        message: "Parameter cckode, startDate, dan endDate wajib diisi.",
      });

    const data = await svc.getBiayaPerDivisi(cckode, startDate, endDate);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getListDivisi,
  getBiayaPerDivisi,
};
