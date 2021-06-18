const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const User = require("../../models/User");
const { getGFS } = require("../../config/db-setup");
const mongoose = require("mongoose");
const ErrorMessages = require("../../constants/ErrorMessages");
const moment = require("moment");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("createdBy", "-password").exec();

    return res.render("Home", {
      user: req.user,
      posts: posts,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
      moment: moment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddPost = (req, res, next) => {
  res.render("AddPost", {
    user: req.user,
    errorMessages: req.flash("error"),
    successMessages: req.flash("success"),
  });
};

exports.handleFileErrors = async (err, req, res, next) => {
  if (err) {
    if (err.message === ErrorMessages.FileMimeTypeError.message) {
      return res.status(415).send();
    } else if (err.message === ErrorMessages.FileEmptyError.message) {
      next();
    }
  } else {
    next();
  }
};

exports.addPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      req.flash("error", "Post should not be empty.");
      return res.status(204).send();
    }

    let newPost = new Post({
      content: content,
      createdBy: req.user._id,
    });

    // save file ref
    if (req.file) {
      newPost.pictureId = req.file.id;
      newPost.pictureName = req.file.filename;
    }

    // save post to db
    const savedPost = await newPost.save();
    if (!savedPost) throw ErrorMessages.InternalServerError;

    // add the post id to the User
    const user = await User.findById(req.user._id);
    if (!user) throw ErrorMessages.InternalServerError;

    user.posts.push(newPost._id);
    await user.save();

    req.flash("success", "Post added");
    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId })
      .populate("createdBy", "-password")
      .exec();
    if (!post) throw ErrorMessages.InternalServerError;

    const postComments = await Comment.find({ toPost: post._id })
      .populate("createdBy", "-password")
      .exec();

    return res.render("Post", {
      user: req.user,
      post: post,
      comments: postComments,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
      moment: moment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEditPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) throw ErrorMessages.InternalServerError;

    res.status(200).render("EditPost", {
      user: req.user,
      post: post,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
      moment: moment,
    });
  } catch (error) {
    next(error);
  }
};

exports.editPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) throw ErrorMessages.InternalServerError;

    const { content } = req.body;
    if (!content) {
      req.flash("error", "Post should not be empty.");
      return res.status(204).send();
    }

    post.content = content;

    // update picture file
    if (req.file) {
      // delete old file from grid fs
      if (post.pictureId) {
        await getGFS().delete(new mongoose.Types.ObjectId(post.pictureId));
      }
      post.pictureId = req.file.id;
      post.pictureName = req.file.filename;
    }

    await post.save();

    req.flash("success", "Post updated.");
    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};

exports.getDeletePostConfirmation = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) throw ErrorMessages.InternalServerError;

    return res.status(200).render("DeleteConfirmation", {
      deleteUrl: `/posts/delete/${req.params.postId}`,
      user: req.user,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) ErrorMessages.InternalServerError;

    // find post comments
    const postComments = await Comment.find({ toPost: post._id });
    if (postComments.length > 0) {
      // remove comment id from the comment author's comments list
      postComments.forEach(
        async (comment) =>
          await User.updateOne(
            { _id: comment.createdBy },
            { $pull: { comments: comment._id } }
          )
      );
      // delete post comments
      await Comment.deleteMany({ toPost: post._id });
    }

    // delete post picture
    if (post.pictureId) {
      await getGFS().delete(new mongoose.Types.ObjectId(post.pictureId));
    }

    // delete post from user's posts
    const user = await User.findById(req.user._id);
    if (!user) throw ErrorMessages.InternalServerError;

    await User.updateOne({ _id: req.user._id }, { $pull: { posts: post._id } });

    const deleted = await Post.deleteOne({ _id: post._id });
    if (!deleted) throw ErrorMessages.InternalServerError;

    req.flash("success", "Post deleted.");
    return res.status(200).redirect("/profile");
  } catch (error) {
    next(error);
  }
};
