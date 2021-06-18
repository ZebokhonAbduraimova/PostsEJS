const router = require("express").Router();
const passport = require("passport");
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const passwordValidator = require("password-validator");
const ErrorMessages = require("../constants/ErrorMessages");
const { notAuthCheck } = require("../middleware/authCheck");

// Password Schema
const pwdSchema = new passwordValidator();
pwdSchema
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .digits(1)
  .has()
  .symbols(1)
  .is()
  .not()
  .oneOf([
    "password",
    "Password",
    "passw0rd",
    "Passw0rd",
    "Password123",
    "password123",
    "passw0rd123",
    "Passw0rd123",
  ]);

const usernameSchema = new passwordValidator();
usernameSchema.is().min(4).is().max(100);

// GET /auth/login
router.get("/login", notAuthCheck, (req, res) => {
  res.render("Login", {
    user: null,
    errorMessages: req.flash("error"),
    successMessages: req.flash("success"),
  });
});

// GET /auth/register
router.get("/local/register", notAuthCheck, (req, res) => {
  res.render("Register", {
    user: req.user,
    errorMessages: req.flash("error"),
    successMessages: req.flash("success"),
  });
});

// GET /auth/logout
router.get("/logout", (req, res) => {
  req.flash("success", "Logged out");
  req.logout();
  res.redirect("/posts");
});

// GET /auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

// GET /auth/google/redirect
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in with Google");
    res.redirect("/posts");
  }
);

// Local Strategy Auth
// POST /auth/local/register
router.post("/local/register", async (req, res, next) => {
  const { name, username, password } = req.body;

  try {
    if (!name || !username || !password) {
      req.flash("error", "Missing credentials");
      throw ErrorMessages.InvalidRequestBodyError;
    }

    // Validate username
    const isUsernameValid = usernameSchema.validate(username);
    if (!isUsernameValid) {
      req.flash(
        "error",
        "Username should be at least 4 characters and at most 100 characters"
      );
      throw ErrorMessages.InvalidRequestBodyError;
    }

    // Validate password
    const isPwdValid = pwdSchema.validate(password);
    if (!isPwdValid) {
      req.flash(
        "error",
        "Password should be at least 8 characters, including uppercase, lowercase, digit and a special symbol"
      );
      throw ErrorMessages.InvalidRequestBodyError;
    }

    // Check if username already registered
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      req.flash("error", "Username already registered.");
      throw ErrorMessages.InvalidRequestBodyError;
    }

    const newUser = new User({
      name,
      username,
      password,
    });

    const salt = await bcryptjs.genSalt(10);
    if (!salt) throw ErrorMessages.InternalServerError;

    const hashedPwd = await bcryptjs.hash(newUser.password, salt);
    if (!hashedPwd) throw ErrorMessages.InternalServerError;

    newUser.password = hashedPwd;
    await newUser.save();

    req.flash("success", "Account successfully created.");
    res.status(200).redirect("/auth/login");
  } catch (error) {
    if (error.message === ErrorMessages.InvalidRequestBodyError.message) {
      return res.render("Register", {
        errorMessages: req.flash("error"),
        successMessages: req.flash("success"),
        name: name,
        username: username,
        password: password,
      });
    } else {
      next(error);
    }
  }
});

// POST /auth/local/login
router.post(
  "/local/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "You are now logged in.");
    res.redirect("/posts");
  }
);

module.exports = router;
