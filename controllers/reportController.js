const { Presensi } = require("../models");

exports.getDailyReport = async (req, res) => {
  try {
    console.log("Controller: Mengambil data laporan harian dari database...");
    
    // Fetch all records from database
    const presensiRecords = await Presensi.findAll({
      order: [['checkIn', 'DESC']]  // newest first
    });
    
    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: presensiRecords,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: error.message 
    });
  }
};
const {Op} = require("../models");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama } = req.query;
    let options = { where: {} };

    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};

