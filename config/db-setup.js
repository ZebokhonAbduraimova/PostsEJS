const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const ErrorMessages = require("../constants/ErrorMessages");
require("dotenv").config();

var gfs;

exports.connectToDb = () => {
  mongoose.connect(
    process.env.mongodbUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err, client) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("MongoDb connected");
        gfs = new mongoose.mongo.GridFSBucket(client.connection.db, {
          bucketName: "uploads",
        });
      }
    }
  );
};

exports.getGFS = () => {
  return gfs;
};

var storage = new GridFsStorage({
  url: process.env.mongodbUri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
  options: {
    useUnifiedTopology: true,
  },
});
exports.upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(ErrorMessages.FileMimeTypeError, false);
    } else {
      callback(null, true);
    }
  },
});
