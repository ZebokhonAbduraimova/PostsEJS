const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  pictureId: {
    type: String,
    default: null,
  },
  pictureName: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", PostSchema);
