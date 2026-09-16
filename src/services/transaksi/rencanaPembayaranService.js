const db = require("../../config/database");

// ── Browse Header: agregasi per Supplier + Bulan Tagihan ──────────────
const getBrowse = async (startDate, endDate, supKode) => {
  let sql = `
    SELECT
      a.vou_sup_kode                                      AS KodeSupplier,
      s.sup_nama                                          AS Supplier,
      MONTH(a.vou_tanggal)                                AS Bulan,
      YEAR(a.vou_tanggal)                                 AS Tahun,
      COUNT(*)                                             AS JumlahVoucher,
      SUM(
        a.vou_total - IFNULL((
          SELECT SUM(d2.voud2_harga * d2.voud2_jumlah)
          FROM kencanaprint.tvoucher_dtl2 d2
          WHERE d2.voud2_vou_nomor = a.vou_nomor
        ), 0)
      )                                                    AS Nominal,
      rp.rp_tgl_rencana                                   AS TglRencana,
      rp.rp_keterangan                                    AS Keterangan
    FROM kencanaprint.tvoucher_hdr a
    LEFT JOIN kencanaprint.tsupplier s ON s.sup_kode = a.vou_sup_kode
    LEFT JOIN trencana_pembayaran rp
           ON rp.rp_sup_kode = a.vou_sup_kode
          AND rp.rp_bulan = MONTH(a.vou_tanggal)
          AND rp.rp_tahun = YEAR(a.vou_tanggal)
    WHERE a.vou_nomor NOT IN (
      SELECT pt.ptd_trs FROM tpengajuan_transfer_dtl pt WHERE pt.ptd_trs <> ''
    )
      AND a.vou_tanggal >= ? AND a.vou_tanggal <= ?
  `;
  const params = [startDate, endDate];

  if (supKode) {
    sql += ` AND a.vou_sup_kode = ?`;
    params.push(supKode);
  }

  sql += `
    GROUP BY a.vou_sup_kode, MONTH(a.vou_tanggal), YEAR(a.vou_tanggal)
    ORDER BY YEAR(a.vou_tanggal) DESC, MONTH(a.vou_tanggal) DESC, s.sup_nama
  `;

  const [rows] = await db.query(sql, params);
  return rows;
};

// ── Browse Detail: voucher-voucher dalam satu grup Supplier+Bulan ─────
const getBrowseDetail = async (startDate, endDate, supKode) => {
  let sql = `
    SELECT
      a.vou_sup_kode                                      AS KodeSupplier,
      MONTH(a.vou_tanggal)                                AS Bulan,
      YEAR(a.vou_tanggal)                                 AS Tahun,
      a.vou_nomor                                         AS Nomor,
      DATE_FORMAT(a.vou_tanggal, '%Y-%m-%d')             AS Tanggal,
      IFNULL(a.vou_nomor_pajak, '')                      AS NomorPajak,
      a.vou_total                                        AS Total,
      IFNULL((
        SELECT SUM(d2.voud2_harga * d2.voud2_jumlah)
        FROM kencanaprint.tvoucher_dtl2 d2
        WHERE d2.voud2_vou_nomor = a.vou_nomor
      ), 0)                                              AS BahanTambahan,
      IFNULL(a.vou_status_realisasi, '')                AS StatusRealisasi
    FROM kencanaprint.tvoucher_hdr a
    WHERE a.vou_nomor NOT IN (
      SELECT pt.ptd_trs FROM tpengajuan_transfer_dtl pt WHERE pt.ptd_trs <> ''
    )
      AND a.vou_tanggal >= ? AND a.vou_tanggal <= ?
  `;
  const params = [startDate, endDate];

  if (supKode) {
    sql += ` AND a.vou_sup_kode = ?`;
    params.push(supKode);
  }

  sql += ` ORDER BY a.vou_sup_kode, a.vou_tanggal`;

  const [rows] = await db.query(sql, params);
  return rows;
};

// ── Upsert Rencana Pembayaran (inline edit tanggal rencana) ───────────
const saveRencana = async (payload, userKode) => {
  const { supKode, bulan, tahun, tglRencana, keterangan } = payload;

  if (!supKode || !bulan || !tahun) {
    throw new Error("Supplier, bulan, dan tahun wajib diisi.");
  }

  await db.query(
    `INSERT INTO trencana_pembayaran
       (rp_sup_kode, rp_bulan, rp_tahun, rp_tgl_rencana, rp_keterangan,
        date_create, user_create)
     VALUES (?, ?, ?, ?, ?, NOW(), ?)
     ON DUPLICATE KEY UPDATE
       rp_tgl_rencana = VALUES(rp_tgl_rencana),
       rp_keterangan  = VALUES(rp_keterangan),
       date_modified  = NOW(),
       user_modified  = VALUES(user_create)`,
    [supKode, bulan, tahun, tglRencana || null, keterangan || "", userKode],
  );

  return { supKode, bulan, tahun, tglRencana, keterangan };
};

module.exports = {
  getBrowse,
  getBrowseDetail,
  saveRencana,
};
