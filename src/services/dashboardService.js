const db = require("../config/database");

const getSummary = async (cabang) => {
  // 1. Kasbon belum selesai
  let kasbonSql = `
    SELECT COUNT(*) AS count, IFNULL(SUM(bon_nominal), 0) AS total
    FROM tkasbon
    WHERE bon_selesai = 0
  `;
  const kasbonParams = [];
  if (cabang && cabang !== "P01" && cabang !== "ALL") {
    kasbonSql += ` AND bon_cabang = ?`;
    kasbonParams.push(cabang);
  }
  const [[kasbonRow]] = await db.query(kasbonSql, kasbonParams);

  // 2. Pengajuan transfer menunggu realisasi
  const [[pjtRow]] = await db.query(`
    SELECT COUNT(*) AS count, IFNULL(SUM(ptd_nominal), 0) AS total
    FROM tpengajuan_transfer_dtl
    WHERE (ptd_jur_no = '' OR ptd_jur_no IS NULL)
      AND (ptd_batal = '' OR ptd_batal IS NULL)
  `);

  // 3. Terima setoran belum verifikasi (fsk_userv kosong)
  // Filter LEFT(fsk_nomor,3) jika bukan pusat
  let setoranSql = `
    SELECT COUNT(*) AS count
    FROM retail.tform_setorkasir_hdr
    WHERE (fsk_userv = '' OR fsk_userv IS NULL)
  `;
  const setoranParams = [];
  if (cabang && cabang !== "P01" && cabang !== "ALL") {
    setoranSql += ` AND LEFT(fsk_nomor, 3) = ?`;
    setoranParams.push(cabang);
  }
  const [[setoranRow]] = await db.query(setoranSql, setoranParams);

  // 4. Server date
  const [[dateRow]] = await db.query(
    `SELECT DATE_FORMAT(NOW(),'%Y-%m-%d') AS serverDate`,
  );

  // 5. Buku Besar — saldo account default cabang
  const defaultAccount =
    cabang === "P01"
      ? "A-111101"
      : cabang === "P02"
        ? "A-111102"
        : cabang === "P04"
          ? "A-111103"
          : "A-111101";

  const [[saldoRow]] = await db.query(
    `SELECT IFNULL(SUM(d.jurd_kredit - d.jurd_debet), 0) AS saldo
     FROM tjurnalitem d
     INNER JOIN tjurnal j ON j.jur_no = d.jurd_jur_no
     WHERE d.jurd_nourut <> 0
       AND j.jur_rek_kode = ?
       AND j.jur_tanggal <= CURDATE()`,
    [defaultAccount],
  );

  // 6. Rekonsiliasi — jumlah yang selisih ≠ 0 bulan ini
  const [[rekonRow]] = await db.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT v.rkv_rek_kode,
         (v.rkv_koran  + IFNULL(SUM(b.rk_nominal),0) - IFNULL(SUM(d.rk_nominal),0))
         - (v.rkv_saldo + IFNULL(SUM(a.rk_nominal),0) - IFNULL(SUM(c.rk_nominal),0)) AS selisih
       FROM trekon_valid v
       LEFT JOIN trekon_det  a ON a.rk_rek_kode=v.rkv_rek_kode AND a.rk_tanggal=v.rkv_tanggal
       LEFT JOIN trekon_det3 c ON c.rk_rek_kode=v.rkv_rek_kode AND c.rk_tanggal=v.rkv_tanggal
       LEFT JOIN trekon_det2 b ON b.rk_rek_kode=v.rkv_rek_kode AND b.rk_tanggal=v.rkv_tanggal
       LEFT JOIN trekon_det4 d ON d.rk_rek_kode=v.rkv_rek_kode AND d.rk_tanggal=v.rkv_tanggal
       WHERE YEAR(v.rkv_tanggal)  = YEAR(CURDATE())
         AND MONTH(v.rkv_tanggal) = MONTH(CURDATE())
       GROUP BY v.rkv_rek_kode, v.rkv_tanggal
     ) x
     WHERE x.selisih <> 0`,
  );

  // 7. Stok Finance — jumlah item REAL negatif di cabang
  const [[stokRow]] = await db.query(
    `SELECT COUNT(*) AS count
     FROM (
       SELECT mst_brg_kode,
         SUM(mst_stok_in - mst_stok_out) AS stk
       FROM finance.tmasterstok_finance
       WHERE mst_aktif = 'Y' AND mst_cab = ?
       GROUP BY mst_brg_kode
     ) x
     LEFT JOIN (
       SELECT msod_brg_kode,
         IFNULL(SUM(msod_jumlah), 0) AS mutasi
       FROM kencanaprint.tgarmenmso_hdr h
       INNER JOIN kencanaprint.tgarmenmso_dtl d ON d.msod_nomor = h.mso_nomor
       WHERE h.mso_msi_nomor = '' AND h.mso_cab = ? AND h.mso_bagian = 'FINANCE'
       GROUP BY msod_brg_kode
     ) m ON m.msod_brg_kode = x.mst_brg_kode
     WHERE (x.stk - IFNULL(m.mutasi, 0)) < 0`,
    [cabang, cabang],
  );

  return {
    kasbon: { count: Number(kasbonRow.count), total: Number(kasbonRow.total) },
    transfer: { count: Number(pjtRow.count), total: Number(pjtRow.total) },
    setoran: { count: Number(setoranRow.count) },
    serverDate: dateRow.serverDate,
    // Tambahan baru:
    saldoKas: { account: defaultAccount, saldo: Number(saldoRow.saldo) },
    rekon: { selisihCount: Number(rekonRow.count) },
    stok: { negativeCount: Number(stokRow.count) },
  };
};

module.exports = { getSummary };
