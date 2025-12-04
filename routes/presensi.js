const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

const authenticateToken = permission.authenticateToken;

// Middleware validasi tanggal
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus berupa format tanggal yang valid (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus berupa format tanggal yang valid (ISO8601)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validasi gagal", errors: errors.array() });
    }
    next();
  },
];

/* ===========================================================
   ✅ CHECK-IN DENGAN FOTO
   - Pakai authenticateToken (bukan authMiddleware!)
   - upload.single('image') untuk terima foto dari frontend
=========================================================== */
router.post(
  '/checkin',
  authenticateToken,
  presensiController.upload.single('image'),
  presensiController.CheckIn
);

/* ===========================================================
   ✅ CHECK-OUT (tanpa foto)
=========================================================== */
router.post("/checkout", authenticateToken, presensiController.CheckOut);

/* ===========================================================
   ✅ GET PRESENSI USER LOGIN
=========================================================== */
router.get("/", authenticateToken, presensiController.getMyPresensi);

/* ===========================================================
   ✅ ADMIN: UPDATE & DELETE PRESENSI
=========================================================== */
router.put(
  "/:id",
  authenticateToken,
  permission.isAdmin,
  validatePresensiUpdate,
  presensiController.updatePresensi
);

router.delete(
  "/:id",
  authenticateToken,
  permission.isAdmin,
  presensiController.deletePresensi
);

module.exports = router;