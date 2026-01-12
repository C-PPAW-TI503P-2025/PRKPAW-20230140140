const { SensorLog } = require('../models');

// Fungsi untuk Modul 13 (Simpan ke DB)
exports.receiveSensorData = async (req, res) => {
  try {
    const { suhu, kelembaban, cahaya } = req.body;
    
    const newData = await SensorLog.create({
      suhu: parseFloat(suhu),
      kelembaban: parseFloat(kelembaban),
      cahaya: parseInt(cahaya) || 0
    });

    console.log(`   [SAVED] Suhu: ${suhu}°C | Lembab: ${kelembaban}% | Cahaya: ${cahaya}`);
    res.status(201).json({ status: "ok", message: "Data berhasil disimpan" });
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Tambahkan ini juga supaya Modul 11 & 12 tidak error kalau masih dipakai
exports.testConnection = (req, res) => {
  console.log("   [PING] Ada koneksi masuk!");
  res.status(200).json({ status: "ok", reply: "Server Aktif" });
};

exports.getSensorHistory = async (req, res) => {
  try {
    const data = await SensorLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    const formattedData = data.reverse(); // Dibalik supaya grafik jalan dari kiri ke kanan
    res.json({ status: "success", data: formattedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};