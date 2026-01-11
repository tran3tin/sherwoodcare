const express = require("express");
const router = express.Router();
const fullNoteController = require("../controllers/fullNoteController");

router.get("/", fullNoteController.getAllNotes);

module.exports = router;
