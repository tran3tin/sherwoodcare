const express = require("express");
const router = express.Router();
const { noteUpload } = require("../utils/noteAttachments");
const generalNoteController = require("../controllers/generalNoteController");

// Any number of files per note (10MB each), stored on local disk under
// UPLOAD_DIR/general-notes
const upload = noteUpload("general-notes");

router.get("/", generalNoteController.getAllNotes);
router.get("/:noteId", generalNoteController.getNoteById);
router.post("/", upload, generalNoteController.createNote);
router.put(
  "/:noteId",
  upload,
  generalNoteController.updateNote
);
router.patch("/:noteId/toggle", generalNoteController.toggleNoteComplete);
router.patch("/:noteId/pin", generalNoteController.toggleNotePin);
router.delete("/:noteId", generalNoteController.deleteNote);

module.exports = router;
