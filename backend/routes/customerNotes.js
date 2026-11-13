const express = require("express");
const router = express.Router();
const { noteUpload } = require("../utils/noteAttachments");
const customerNoteController = require("../controllers/customerNoteController");

// Any number of files per note (10MB each), stored on local disk under
// UPLOAD_DIR/customer-notes
const upload = noteUpload("customer-notes");

// Routes
router.get(
  "/customer/:customerId",
  customerNoteController.getNotesByCustomerId
);
router.get("/customer/:customerId/count", customerNoteController.getNotesCount);
router.get("/:noteId", customerNoteController.getNoteById);
router.post(
  "/",
  upload,
  customerNoteController.createNote
);
router.put(
  "/:noteId",
  upload,
  customerNoteController.updateNote
);
router.patch("/:noteId/toggle", customerNoteController.toggleNoteComplete);
router.patch("/:noteId/pin", customerNoteController.toggleNotePin);
router.delete("/:noteId", customerNoteController.deleteNote);

module.exports = router;
