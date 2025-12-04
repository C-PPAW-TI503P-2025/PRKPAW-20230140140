const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

const multer = require("multer");
const path = require("path");

// ======================= MULTER CONFIG ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder penyimpanan foto
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
};

exports.upload = multer({ storage, fileFilter });

// ======================= CHECK-IN ==========================
exports.CheckIn = async (req, res) => {
  try {
    console.log("CheckIn by:", req.user);

    const userId = req.user.id;
    const now = new Date();

    const { latitude, longitude } = req.body;

    // Ambil foto jika ada
    const buktiFoto = req.file ? req.file.path : null;

    // Cek apakah user belum checkout
    const existing = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existing) {
      return res.status(400).json({
        message: "Anda sudah check-in dan belum check-out.",
      });
    }

    // Simpan ke database
    const newRecord = await Presensi.create({
      userId,
      checkIn: now,
      latitude: latitude || null,
      longitude: longitude || null,
      buktiFoto, // Tambahkan foto
    });

    res.status(201).json({
      message: "Check-in berhasil.",
      data: {
        userId,
        checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),
        latitude: newRecord.latitude,
        longitude: newRecord.longitude,
        buktiFoto,
      },
    });
  } catch (err) {
    console.error("❌ CheckIn Error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ======================= CHECK-OUT ==========================
exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message:
          "Tidak ada check-in aktif. Anda belum check-in atau sudah check-out.",
      });
    }

    recordToUpdate.checkOut = now;
    await recordToUpdate.save();

    res.json({
      message: `Check-out berhasil pada ${format(now, "HH:mm:ss", {
        timeZone,
      })} WIB`,
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================= GET PRESENSI USER LOGIN ==========================
exports.getMyPresensi = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await Presensi.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role"],
        },
      ],
      order: [["checkIn", "DESC"]],
    });

    res.json({
      message: "Data presensi berhasil diambil",
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================= UPDATE PRESENSI ==========================
exports.updatePresensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    const record = await Presensi.findByPk(id);
    if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });

    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);

    await record.save();

    res.json({ message: "Presensi berhasil diperbarui", data: record });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================= DELETE PRESENSI ==========================
exports.deletePresensi = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Presensi.findByPk(id);
    if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });

    await record.destroy();
    res.status(200).json({ message: "Presensi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
