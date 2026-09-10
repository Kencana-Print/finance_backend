// config/changelog.js
const changelogs = {
  "1.0.9": ["Laporan baru : Laporan Biaya per Divisi"],
  "1.0.8": [
    "Pembaruan pada modul Uang Muka, sekarang Pengajuan Dana dipanggil ketika Penyelesaian Uang Muka, bukan ketika Buat Uang Muka, agar satu dokumen Uang Muka bisa digunakan untuk beberapa Pengajuan Dana",
  ],
  "1.0.7": [
    "Laporan Daftar Hutang, dipindahkan dari MANKSI. Disertai penambahan card Hutang pada Dashboard",
  ],
  "1.0.6": [
    "Modul baru Mutasi Out Garmen, dipindahkan dari MANKSI",
    "Perbaikan dari hasil meeting (Part 1)",
  ],
  "1.0.5": ["Perbaikan dan Stabilisasi Sistem"],
  "1.0.4": ["Modul baru Voucher Pembayaran dan Realisasi Voucher Pembayaran"],
  "1.0.3": ["Update User Experience"],
  "1.0.2": ["Update Master User dan Ganti Password"],
  "1.0.1": ["Menu Laporan selesai, dan Perbaikan Tampilan serta Dashboard"],
  "1.0.0": ["Rilis awal sistem Finance"],
};

module.exports = changelogs;
