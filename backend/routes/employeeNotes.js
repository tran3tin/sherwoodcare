const express = require("express");
const router = express.Router();
const { noteUpload } = require("../utils/noteAttachments");
const employeeNoteController = require("../controllers/employeeNoteController");

// Any number of files per note (10MB each), stored on local disk under
// UPLOAD_DIR/employee-notes
const upload = noteUpload("employee-notes");

// Routes
router.get(
  "/employee/:employeeId",
  employeeNoteController.getNotesByEmployeeId
);
router.get("/employee/:employeeId/count", employeeNoteController.getNotesCount);
router.get("/:noteId", employeeNoteController.getNoteById);
router.post(
  "/",
  upload,
  employeeNoteController.createNote
);
router.put(
  "/:noteId",
  upload,
  employeeNoteController.updateNote
);
router.patch("/:noteId/toggle", employeeNoteController.toggleNoteComplete);
router.patch("/:noteId/pin", employeeNoteController.toggleNotePin);
router.delete("/:noteId", employeeNoteController.deleteNote);

module.exports = router;
