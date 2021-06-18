const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  googleId: String,
  thumbnailId: {
    type: String,
    default: null,
  },
  thumbnailName: {
    type: String,
    default: null,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);
