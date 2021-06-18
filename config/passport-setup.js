const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require("bcryptjs");
require("dotenv").config();

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, "-password -__v", function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      // options for google strategy
      clientID: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, callback) => {
      User.findOrCreate(
        {
          name: profile.displayName,
          googleId: profile.id,
        },
        function (err, newUser) {
          return callback(err, newUser);
        }
      );
    }
  )
);

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Invalid Credentials." });
      }

      // Match password
      bcryptjs.compare(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          User.findById(user.id, "-password -__v", function (err, userInfo) {
            return done(null, userInfo);
          });
        } else {
          return done(null, false, { message: "Invalid Credentials." });
        }
      });
    });
  })
);
