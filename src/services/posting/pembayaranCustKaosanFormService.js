const db = require("../../config/database");
const { cekTutupPeriode } = require("../tutupBukuService");

// ── Get data untuk posting ────────────────────────────────────────────
const getDataPosting = async (startDate, endDate, cabang) => {
  const cabFilter = cabang && cabang !== "ALL";

  // Kita gunakan Subquery (Derived Table) agar Uraian yang panjang
  // bisa langsung dibandingkan dengan jur_keterangan di tjurnal
  let subSql = `
    SELECT
      DATE_FORMAT(h.sh_tanggal, '%Y-%m-%d')        AS Tanggal,
      h.sh_nomor                                   AS Nomor,
      IF(h.sh_jenis = 0, g.gdg_akun, h.sh_akun)    AS RekKode,
      IF(h.sh_jenis = 0,
        IFNULL(t.rek_nama, ''),
        IFNULL(r.rek_nama, '')
      )                                            AS RekNama,
      h.sh_nominal                                 AS Nominal,
      IFNULL((
        SELECT RIGHT(p.pd_ph_nomor, 17)
        FROM retail.tsetor_dtl d
        LEFT JOIN retail.tpiutang_dtl p ON p.pd_sd_angsur = d.sd_angsur
        WHERE d.sd_sh_nomor = h.sh_nomor
          AND p.pd_ph_nomor IS NOT NULL
          AND p.pd_ph_nomor <> ''
        LIMIT 1
      ), IFNULL((
        SELECT d2.sd_inv FROM retail.tsetor_dtl d2
        WHERE d2.sd_sh_nomor = h.sh_nomor
          AND d2.sd_inv IS NOT NULL
          AND d2.sd_inv <> ''
        LIMIT 1
      ), ''))                                      AS Uraian,
      IFNULL(c.cus_nama, '')                       AS Customer,
      IF(h.sh_jenis = 0, 'TUNAI',
        IF(h.sh_jenis = 1, 'TRANSFER', 'GIRO'))    AS Trs,
      DATE_FORMAT(h.sh_tgltransfer, '%Y-%m-%d')    AS TglTransfer,
      LEFT(h.sh_nomor, 3)                          AS Cab
    FROM retail.tsetor_hdr h
    LEFT JOIN retail.tcustomer c ON c.cus_kode = h.sh_cus_kode
    LEFT JOIN finance.trekening r ON r.rek_kode = h.sh_akun
    LEFT JOIN retail.tgudang g ON g.gdg_kode = LEFT(h.sh_nomor, 3)
    LEFT JOIN finance.trekening t ON t.rek_kode = g.gdg_akun
    WHERE (h.sh_jenis = 0 OR h.sh_jenis = 1)
  `;

  const params = [];
  if (cabFilter) {
    subSql += ` AND LEFT(h.sh_nomor, 3) = ?`;
    params.push(cabang);
  }
  subSql += ` AND h.sh_tanggal BETWEEN ? AND ?`;
  params.push(startDate, endDate);

  // Bandingkan Uraian baru dengan jur_keterangan lama
  const sql = `
    SELECT x.*,
      IF(j.jur_nomor IS NOT NULL,
        IF(IFNULL(j.jur_keterangan, '') <> IFNULL(x.Uraian, ''), 'Update', 'Sudah'),
        ''
      ) AS Status
    FROM (${subSql}) x
    LEFT JOIN finance.tjurnal j ON j.jur_otomatis = 2 
                               AND j.jur_cabang = x.Cab 
                               AND j.jur_nomor = x.Nomor
    ORDER BY x.Tanggal ASC, x.Nomor ASC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
};

// ── Get daftar cabang ─────────────────────────────────────────────────
const getCabang = async () => {
  const [rows] = await db.query(
    `SELECT gdg_kode AS kode, gdg_nama AS nama
     FROM retail.tgudang
     ORDER BY gdg_kode`,
  );
  return rows;
};

// ── Posting ────────────────────────────────────────────────────────────
const doPosting = async (items, userLogin) => {
  if (!items || items.length === 0)
    throw new Error("Tidak ada data yang akan di posting.");

  // Izinkan data yang Statusnya kosong (Baru) atau "Update" (Revisi invoice)
  const pending = items.filter(
    (d) => (d.Status || "") === "" || d.Status === "Update",
  );
  if (pending.length === 0) throw new Error("Semua data sudah diposting.");

  const results = [];
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    for (const row of pending) {
      const { Tanggal, Nomor, RekKode, Nominal, Uraian, Cab } = row;

      const tutup = await cekTutupPeriode(Tanggal);
      if (tutup) {
        results.push({
          nomor: Nomor,
          status: "Skip",
          message: "Periode sudah ditutup.",
        });
        continue;
      }

      const ckredit = "A-121101";

      // PENTING: Hapus anak (tjurnalitem) dulu sebelum menghapus induk (tjurnal)
      // agar tidak error FK Constraint (Gagal Posting)
      await conn.query(`DELETE FROM tjurnalitem WHERE jurd_jur_no = ?`, [
        Nomor,
      ]);

      await conn.query(
        `DELETE FROM tjurnal
         WHERE jur_otomatis = 2
           AND jur_cabang = ?
           AND jur_nomor = ?`,
        [Cab, Nomor],
      );

      // INSERT tjurnal header
      await conn.query(
        `INSERT INTO tjurnal
           (jur_no, jur_nomor, jur_tanggal, jur_tipetransaksi, jur_cabang,
            jur_otomatis, jur_keterangan, jur_rek_kode, date_create, user_create)
         VALUES (?, ?, ?, 'PBK', ?, 2, ?, ?, NOW(), ?)`,
        [Nomor, Nomor, Tanggal, Cab, Uraian, RekKode, userLogin],
      );

      // INSERT tjurnalitem — baris debet
      await conn.query(
        `INSERT INTO tjurnalitem
           (jurd_jur_no, jurd_rek_kode, jurd_debet, jurd_uraian)
         VALUES (?, ?, ?, ?)`,
        [Nomor, RekKode, Number(Nominal), Uraian],
      );

      // INSERT tjurnalitem — baris kredit
      await conn.query(
        `INSERT INTO tjurnalitem
           (jurd_jur_no, jurd_trs, jurd_nourut, jurd_uraian, jurd_kredit, jurd_rek_kode)
         VALUES (?, 'PBK', 1, ?, ?, ?)`,
        [Nomor, Uraian, Number(Nominal), ckredit],
      );

      results.push({ nomor: Nomor, status: "Sukses", message: "" });
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  return results;
};

module.exports = { getDataPosting, getCabang, doPosting };
