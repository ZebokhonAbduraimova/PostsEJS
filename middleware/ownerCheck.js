const Post = require("../models/Post");
const Comment = require("../models/Comment");
const ErrorMessages = require("../constants/ErrorMessages");

module.exports = {
  checkPostAuthor: async function (req, res, next) {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      next(ErrorMessages.InternalServerError);
    } else if (post.createdBy.toString() === req.user._id.toString()) {
      next();
    } else {
      next(ErrorMessages.ForbiddenError);
    }
  },
  checkCommentAuthor: async function (req, res, next) {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      next(ErrorMessages.InternalServerError);
    } else if (comment.createdBy.toString() === req.user._id.toString()) {
      next();
    } else {
      next(ErrorMessages.ForbiddenError);
    }
  },
};
