const router = require("express").Router();
const {
  addComment,
  editCommentById,
  deleteCommentById,
  getEditComment,
  getDeleteCommentConfirmation,
} = require("../controllers/comments/comments.controller");
const { authCheck } = require("../middleware/authCheck");
const { checkCommentAuthor } = require("../middleware/ownerCheck");
const validIdCheck = require("../middleware/validIdCheck");

// @route /comments/:postId
// @method POST
// @desc Add new comment to post with id
router.post("/:postId", validIdCheck, authCheck, addComment);

// @route /comments/edit/:commentId
// @methods GET and PUT
router
  .route("/edit/:commentId")
  .get(validIdCheck, authCheck, checkCommentAuthor, getEditComment)
  .put(validIdCheck, authCheck, checkCommentAuthor, editCommentById);

// @route /comments/confirm/delete/:commentId
router.get(
  "/confirm/delete/:commentId",
  validIdCheck,
  authCheck,
  checkCommentAuthor,
  getDeleteCommentConfirmation
);

// @route /comments/delete/:commentId
// @method GET
// @desc deletes comment
router.delete(
  "/delete/:commentId",
  validIdCheck,
  authCheck,
  checkCommentAuthor,
  deleteCommentById
);

module.exports = router;
