const db = require("../../config/database");

// ── Lookup Divisi (Cost Center) ────────────────────────────────────────
const getListDivisi = async () => {
  const [rows] = await db.query(
    `SELECT cc_kode AS kode, cc_nama AS nama
     FROM tcostcenter
     ORDER BY cc_kode`,
  );
  return rows;
};

// ── Laporan Biaya per Divisi ────────────────────────────────────────────
// Sumber: tjurnalitem (baris debet realisasi BKK/BBK), di-link ke tkasbon
// via bon_jur_no untuk memastikan HANYA transaksi dari alur Uang Muka /
// Penyelesaian Uang Muka yang terambil.
//
// No. Pengajuan diambil per-BARIS jurnal (bukan per-header kasbon), karena
// jurd_nourut selalu sama persis dengan nourut di tabel detail asalnya
// (pmd_nourut / bond_nourut / bond2_nourut — lihat uangMukaPenyelesaianService
// saveData: noUrut = d.ga !== 0 ? d.no : nourut - 1). Urutan pencarian:
//   1. Item GA (tpermintaan_dtl, pmd_bon + pmd_nourut) → pengajuan asli
//   2. Item baru non-GA dengan link (tkasbonitem2, bond2_link) → MB/IV/POE/VOU
//   3. Fallback ke bon_pjh_nomor header — untuk kasbon format lama yang
//      seluruh kasbonnya memang terikat satu pengajuan di level header.
const getBiayaPerDivisi = async (cckode, startDate, endDate) => {
  const [divisiRow] = await db.query(
    `SELECT cc_kode AS kode, cc_nama AS nama FROM tcostcenter WHERE cc_kode = ?`,
    [cckode],
  );
  if (!divisiRow.length) throw new Error("Divisi tidak ditemukan.");

  const [rows] = await db.query(
    `SELECT
       IFNULL(r.rek_kode, i.jurd_rek_kode)               AS RekKode,
       IFNULL(r.rek_nama, i.jurd_rek_kode)               AS NamaAkun,
       COALESCE(
         gaPjh.pjh_nomor,
         NULLIF(item2.bond2_link, ''),
         NULLIF(k.bon_pjh_nomor, '')
       )                                                  AS NoPengajuan,
       item2.bond2_link                                   AS DebugLink,
       item2.bond2_nourut                                 AS DebugItemNourut,
       i.jurd_nourut                                       AS DebugJurdNourut,
       k.bon_nomor                                         AS DebugBonNomor,
       DATE_FORMAT(
         COALESCE(gaPjh.pjh_tanggal, headerPjh.pjh_tanggal, k.bon_tanggal),
         '%Y-%m-%d'
       )                                                  AS TanggalPengajuan,
       j.jur_no                                           AS NoBkkBbk,
       DATE_FORMAT(j.jur_tanggal, '%Y-%m-%d')             AS TanggalBkkBbk,
       IFNULL(i.jurd_dcnama, '')                          AS DetailCC,
       i.jurd_uraian                                      AS Uraian,
       IFNULL(i.jurd_debet, 0)                            AS Nominal
     FROM tjurnalitem i
     INNER JOIN tjurnal j ON j.jur_no = i.jurd_jur_no
     INNER JOIN tkasbon k ON k.bon_jur_no = j.jur_no
     LEFT JOIN trekening r ON r.rek_kode = i.jurd_rek_kode
     LEFT JOIN ga2.tpermintaan_dtl gaDtl
            ON gaDtl.pmd_bon = k.bon_nomor
           AND gaDtl.pmd_nourut = i.jurd_nourut
     LEFT JOIN ga2.tpermintaan_hdr gaHdr
            ON gaHdr.pmt_nomor = gaDtl.pmd_pmt_nomor
     LEFT JOIN ga2.tpengajuan2_hdr gaPjh
            ON gaPjh.pjh_nomor = gaHdr.pmt_pjh_nomor
     LEFT JOIN tkasbonitem2 item2
            ON item2.bond2_nomor = k.bon_nomor
           AND item2.bond2_nourut = i.jurd_nourut
     LEFT JOIN ga2.tpengajuan2_hdr headerPjh
            ON headerPjh.pjh_nomor = k.bon_pjh_nomor
     WHERE i.jurd_nourut <> 0
       AND i.jurd_trs IN ('BKK', 'BBK')
       AND i.jurd_cc_kode = ?
       AND j.jur_tanggal >= ? AND j.jur_tanggal <= ?
     ORDER BY IFNULL(r.rek_nama, i.jurd_rek_kode), j.jur_tanggal, j.jur_no`,
    [cckode, startDate, endDate],
  );

  // ── Group per Nama Akun (sesuai format cetak: header akun + detail) ──
  const grouped = new Map();
  for (const row of rows) {
    const key = row.RekKode;
    if (!grouped.has(key)) {
      grouped.set(key, {
        rekKode: row.RekKode,
        namaAkun: row.NamaAkun,
        totalNominal: 0,
        detail: [],
      });
    }
    const g = grouped.get(key);
    g.totalNominal += Number(row.Nominal) || 0;
    g.detail.push({
      noPengajuan: row.NoPengajuan || "",
      tanggalPengajuan: row.TanggalPengajuan,
      noBkkBbk: row.NoBkkBbk,
      tanggalBkkBbk: row.TanggalBkkBbk,
      detailCC: row.DetailCC,
      uraian: row.Uraian,
      nominal: Number(row.Nominal) || 0,
    });
  }

  const akunList = Array.from(grouped.values());
  const grandTotal = akunList.reduce((s, a) => s + a.totalNominal, 0);

  return {
    divisi: divisiRow[0],
    akunList,
    grandTotal,
  };
};

module.exports = {
  getListDivisi,
  getBiayaPerDivisi,
};
