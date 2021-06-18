const Comment = require("../../models/Comment");
const User = require("../../models/User");
const ErrorMessages = require("../../constants/ErrorMessages");

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      req.flash("error", "Comment should not be empty.");
      return res.redirect(`/posts/${req.params.postId}`);
    }
    const newComment = await Comment.create({
      content: content,
      createdBy: req.user._id,
      toPost: req.params.postId,
    });
    if (!newComment) throw ErrorMessages.InternalServerError;

    // add new post id to User
    const user = await User.findById(req.user._id);
    if (!user) throw ErrorMessages.InternalServerError;

    user.comments.push(newComment._id);
    await user.save();

    req.flash("success", "Comment added.");
    return res.status(200).redirect(`/posts/${req.params.postId}`);
  } catch (error) {
    next(error);
  }
};

exports.getEditComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("toPost")
      .exec();
    if (!comment) throw ErrorMessages.InternalServerError;

    return res.status(200).render("EditComment", {
      comment: comment,
      user: req.user,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
    });
  } catch (error) {
    next(error);
  }
};

exports.editCommentById = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) throw ErrorMessages.InternalServerError;

    const { content } = req.body;
    if (!content) {
      req.flash("error", "Comment field should not be empty.");
      return res.redirect(`/comments/edit/${req.params.commentId}`);
    }

    comment.content = content;
    await comment.save();

    req.flash("success", "Comment successfully updated.");
    return res.status(200).redirect(`/posts/${comment.toPost}`);
  } catch (error) {
    next(error);
  }
};

exports.getDeleteCommentConfirmation = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) throw ErrorMessages.InternalServerError;

    return res.status(200).render("DeleteConfirmation", {
      deleteUrl: `/comments/delete/${req.params.commentId}`,
      user: req.user,
      errorMessages: req.flash("error"),
      successMessages: req.flash("success"),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCommentById = async (req, res) => {
  try {
    // delete comment from user's comments
    const user = await User.findById(req.user._id);
    if (!user) throw ErrorMessages.InternalServerError;

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { comments: req.params.commentId } }
    );

    const commentToDel = await Comment.deleteOne({ _id: req.params.commentId });
    if (!commentToDel) throw ErrorMessages.InternalServerError;

    req.flash("success", "Comment successfully deleted.");
    return res.status(200).redirect("/profile");
  } catch (error) {
    next(error);
  }
};
