const { authCheck } = require("../middleware/authCheck");
const { checkPostAuthor } = require("../middleware/ownerCheck");
const validIdCheck = require("../middleware/validIdCheck");

const {
  getPosts,
  addPost,
  getPostById,
  editPostById,
  getAddPost,
  deletePostById,
  getEditPost,
  getDeletePostConfirmation,
  handleFileErrors,
} = require("../controllers/posts/posts.controller");
const fileUpload = require("../middleware/fileUpload");
const router = require("express").Router();

// @router /posts
router.route("/").get(getPosts);

// @route /posts/add
router
  .route("/add")
  .get(authCheck, getAddPost)
  .post(authCheck, fileUpload, handleFileErrors, addPost);

// @route /posts/:postId
router.get("/:postId", validIdCheck, getPostById);

// @route /posts/confirm/delete/:postId
router.get(
  "/confirm/delete/:postId",
  validIdCheck,
  authCheck,
  checkPostAuthor,
  getDeletePostConfirmation
);

// @route /posts/delete/:postId
router.delete(
  "/delete/:postId",
  validIdCheck,
  authCheck,
  checkPostAuthor,
  deletePostById
);

// @route /posts/edit/:postId
router
  .route("/edit/:postId")
  .get(validIdCheck, authCheck, checkPostAuthor, getEditPost)
  .put(
    validIdCheck,
    authCheck,
    checkPostAuthor,
    fileUpload,
    handleFileErrors,
    editPostById
  );

module.exports = router;
