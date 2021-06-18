const User = require("../../models/User");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const ErrorMessages = require("../../constants/ErrorMessages");
const moment = require("moment");
const { getGFS } = require("../../config/db-setup");
const mongoose = require("mongoose");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -__v")
      .populate("posts")
      .populate("comments")
      .exec();

    if (!user) throw ErrorMessages.InternalServerError;

    return res.render("Profile", {
      user: user,
      posts: user.posts,
      comments: user.comments,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
      moment: moment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDeleteAccountConfirmation = async (req, res, next) => {
  try {
    const userToDel = await User.findById(req.user._id);
    if (!userToDel) throw ErrorMessages.InternalServerError;

    return res.status(200).render("DeleteConfirmation", {
      deleteUrl: `/profile/delete`,
      user: req.user,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userToDel = await User.findById(req.user._id);
    if (!userToDel) throw ErrorMessages.InternalServerError;

    if (userToDel.posts.length > 0) {
      // delete posts pictures
      const postsToDel = await Post.find({ _id: { $in: userToDel.posts } });
      for (let i = 0; i < postsToDel.length; i++) {
        if (postsToDel[i].pictureId) {
          await getGFS().delete(
            new mongoose.Types.ObjectId(postsToDel[i].pictureId)
          );
        }
      }
      // delete posts
      await Post.deleteMany({ _id: { $in: userToDel.posts } });
    }

    if (userToDel.comments.length > 0) {
      await Comment.deleteMany({ _id: { $in: userToDel.comments } });
    }

    // delete user thumbnail picture
    if (userToDel.thumbnailName) {
      await getGFS().delete(new mongoose.Types.ObjectId(userToDel.thumbnailId));
    }

    const deleted = await userToDel.delete();
    if (!deleted) throw ErrorMessages.InternalServerError;

    req.flash("success", "Account deleted.");
    return res.redirect("/posts");
  } catch (error) {
    next(error);
  }
};

exports.handleThumbnailUploadErrors = async (err, req, res, next) => {
  if (err) {
    if (err.message === ErrorMessages.FileEmptyError.message) {
      req.flash("error", "No file attached.");
      return res.redirect("/profile");
    } else if (err.message === ErrorMessages.FileMimeTypeError.message) {
      req.flash("error", "File should be image.");
      return res.redirect("/profile");
    }
  } else {
    next();
  }
};

exports.updateThumbnail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw ErrorMessages.InternalServerError;

    if (user.thumbnailName) {
      await getGFS().delete(new mongoose.Types.ObjectId(user.thumbnailId));
    }
    user.thumbnailId = req.file.id;
    user.thumbnailName = req.file.filename;

    const savedUser = await user.save();
    if (!savedUser) throw ErrorMessages.InternalServerError;

    req.flash("success", "Yeah! Picture updated.");
    return res.redirect("/profile");
  } catch (error) {
    next(error);
  }
};
