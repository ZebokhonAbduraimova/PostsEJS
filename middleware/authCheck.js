const ErrorMessages = require("../constants/ErrorMessages");

module.exports = {
  authCheck: (req, res, next) => {
    if (!req.user) {
      next(ErrorMessages.UnauthorizedError);
    } else {
      next();
    }
  },
  // to protect login and register pages when logged in
  notAuthCheck: (req, res, next) => {
    if (req.user) {
      return res.redirect("/posts");
    } else {
      next();
    }
  },
};
