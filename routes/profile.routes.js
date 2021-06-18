const {
  getProfile,
  deleteAccount,
  getDeleteAccountConfirmation,
  updateThumbnail,
  handleThumbnailUploadErrors,
} = require("../controllers/profile/profile.controller");
const { authCheck } = require("../middleware/authCheck");
const fileUpload = require("../middleware/fileUpload");

const router = require("express").Router();

// @route GET /profile
router.get("/", authCheck, getProfile);

// @oute POST /profile/thumbnail
router.post(
  "/thumbnail",
  authCheck,
  fileUpload,
  handleThumbnailUploadErrors,
  updateThumbnail
);

// @route GET /profile/confirm/delete
router.get("/confirm/delete", authCheck, getDeleteAccountConfirmation);

// @route GET /profile/delete
router.delete("/delete", authCheck, deleteAccount);

module.exports = router;
