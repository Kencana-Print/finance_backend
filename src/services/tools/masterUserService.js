const db = require("../../config/database");

const getBrowse = async () => {
  const [rows] = await db.query(
    `SELECT
       user_kode                              AS Kode,
       user_nama                              AS Nama,
       user_cabang                            AS Cabang,
       IF(user_aktif = 0, 'YA', 'TIDAK')     AS Aktif
     FROM tuser
     ORDER BY user_nama`,
  );
  return rows;
};

const deleteUser = async (kode) => {
  await db.query(`DELETE FROM thakuser WHERE hak_user_kode = ?`, [kode]);
  const [result] = await db.query(`DELETE FROM tuser WHERE user_kode = ?`, [
    kode,
  ]);
  if (result.affectedRows === 0) throw new Error("User tidak ditemukan.");
  return { kode };
};

module.exports = { getBrowse, deleteUser };
