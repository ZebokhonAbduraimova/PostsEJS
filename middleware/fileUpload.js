const ErrorMessages = require("../constants/ErrorMessages");
const { upload } = require("../config/db-setup");
const multer = require("multer");
const singleUpload = upload.single("file");

module.exports = function (req, res, next) {
  return singleUpload(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        next(ErrorMessages.InternalServerError);
      } else if (err.message === ErrorMessages.FileMimeTypeError.message) {
        next(ErrorMessages.FileMimeTypeError);
      }
      next(err);
    } else if (!req.file) {
      next(ErrorMessages.FileEmptyError);
    } else {
      next();
    }
  });
};
