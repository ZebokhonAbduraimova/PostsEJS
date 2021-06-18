const {
  getPictureByName,
} = require("../controllers/pictures/pictures.controller");

const router = require("express").Router();

// @route /pictures/:pictureName
router.get("/:pictureName", getPictureByName);

module.exports = router;
