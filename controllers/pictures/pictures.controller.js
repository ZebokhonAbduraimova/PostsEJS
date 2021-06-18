const { getGFS } = require("../../config/db-setup");
const ErrorMessages = require("../../constants/ErrorMessages");

exports.getPictureByName = (req, res, next) => {
  try {
    getGFS()
      .find({ filename: req.params.pictureName })
      .toArray((err, files) => {
        if (err) throw err;
        else if (!files[0] || files.length === 0) {
          throw ErrorMessages.InternalServerError;
        }

        getGFS().openDownloadStreamByName(req.params.pictureName).pipe(res);
      });
  } catch (error) {
    next(error);
  }
};
