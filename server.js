const express = require("express");
const passport = require("passport");
const engine = require("ejs-mate");
const passportSetup = require("./config/passport-setup");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const { connectToDb } = require("./config/db-setup");
const ErrorMessages = require("./constants/ErrorMessages");
const methodOverride = require("method-override");
const helmet = require("helmet");
const compression = require("compression");
const MemoryStore = require("memorystore")(session);
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors());

// db setup
connectToDb();

app.engine("ejs", engine);

if (process.env.NODE_ENV === "production") {
  app.set("views", __dirname + "/build/views");
  app.use(express.static(path.join(__dirname, "/build/public")));
} else {
  app.set("views", __dirname + "/views");
  app.use(express.static(path.join(__dirname, "public")));
}

app.set("view engine", "ejs");

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 43200000 },
    store: new MemoryStore({
      checkPeriod: 43200000,
    }),
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// tinymce editor
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// home route
app.get("/", (req, res) => {
  res.redirect("/posts");
});

// routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/posts", require("./routes/posts.routes"));
app.use("/comments", require("./routes/comments.routes"));
app.use("/profile", require("./routes/profile.routes"));
app.use("/pictures", require("./routes/pictures.routes"));

// favicon
app.get("/favicon.ico", (req, res) => {
  res.status(200).end();
});

// Not Found GET
app.get("*", (req, res, next) => {
  next(ErrorMessages.NotFoundError);
});

// Error Handler Middleware
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500);

  // Unauthorised -> redirect to login page
  if (error.message === ErrorMessages.UnauthorizedError.message) {
    res.redirect("/auth/login");
  }
  // Not found, Server error -> redirect to Error page
  else if (error.displayErrorPage) {
    res.render("Error", {
      user: req.user || null,
      error: error,
    });
  }
});

const thePort = process.env.PORT || 5000;
const theServer = app.listen(thePort, () => {
  console.log("Server running");
});

process.on("SIGTERM", () => {
  theServer.close();
});
