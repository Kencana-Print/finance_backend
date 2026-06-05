const db = require("../config/database");

const getSummary = async (cabang) => {
  // 1. Query Kasbon Belum Selesai (bon_selesai = 0)
  let kasbonSql = `
    SELECT COUNT(*) AS count, IFNULL(SUM(bon_nominal), 0) AS total
    FROM tkasbon
    WHERE bon_selesai = 0
  `;
  let kasbonParams = [];

  // Filter cabang jika bukan admin pusat ('ALL' / 'P01' - Sesuaikan dengan logikamu)
  if (cabang && cabang !== "P01" && cabang !== "ALL") {
    kasbonSql += ` AND bon_cabang = ?`;
    kasbonParams.push(cabang);
  }

  const [[kasbonRow]] = await db.query(kasbonSql, kasbonParams);

  // 2. Query Pengajuan Transfer Menunggu
  // (Detail yang belum dijurnal dan belum dibatalkan)
  const pjtSql = `
    SELECT COUNT(*) AS count, IFNULL(SUM(ptd_nominal), 0) AS total
    FROM tpengajuan_transfer_dtl
    WHERE (ptd_jur_no = '' OR ptd_jur_no IS NULL)
      AND (ptd_batal = '' OR ptd_batal IS NULL)
  `;
  // Biasanya transfer tidak difilter per cabang header, tapi jika ada, tambahkan JOIN ke tpengajuan_transfer_hdr.
  // Untuk saat ini kita ambil semua yang pending.
  const [[pjtRow]] = await db.query(pjtSql);

  return {
    kasbon: {
      count: Number(kasbonRow.count),
      total: Number(kasbonRow.total),
    },
    transfer: {
      count: Number(pjtRow.count),
      total: Number(pjtRow.total),
    },
  };
};

module.exports = { getSummary };
