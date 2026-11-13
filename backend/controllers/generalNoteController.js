const GeneralNoteModel = require("../models/GeneralNoteModel");
const NoteAttachmentModel = require("../models/NoteAttachmentModel");
const {
  uploadedFiles,
  applyAttachmentChanges,
  deleteAllAttachments,
} = require("../utils/noteAttachments");

const NOTE_TYPE = "general";
const UPLOAD_FOLDER = "general-notes";

// Adds the `attachments` array ({ id, url, name }) to a note or list of notes
const withAttachments = (notes) =>
  NoteAttachmentModel.attachTo(notes, NOTE_TYPE);

const getAllNotes = async (req, res) => {
  try {
    const notes = await GeneralNoteModel.getAll();
    res.json({ success: true, data: await withAttachments(notes) });
  } catch (error) {
    console.error("Error fetching general notes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await GeneralNoteModel.getById(noteId);

    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.json({ success: true, data: await withAttachments(note) });
  } catch (error) {
    console.error("Error fetching general note:", error);
    res.status(500).json({ success: false, error: "Failed to fetch note" });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, priority, due_date } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }


    const noteData = {
      title,
      content: content || "",
      priority: priority || "medium",
      due_date: due_date || null,
    };

    const created = await GeneralNoteModel.create(noteData);
    await NoteAttachmentModel.add(
      NOTE_TYPE,
      created.note_id,
      uploadedFiles(req, UPLOAD_FOLDER)
    );
    const newNote = await GeneralNoteModel.getById(created.note_id);
    res
      .status(201)
      .json({ success: true, data: await withAttachments(newNote) });
  } catch (error) {
    console.error("Error creating general note:", error);
    res.status(500).json({ success: false, error: "Failed to create note" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, priority, due_date, is_completed } = req.body;

    const existingNote = await GeneralNoteModel.getById(noteId);
    if (!existingNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    // Remove the attachments the user deleted, then add the new uploads.
    // Existing files are kept: a note can hold any number of attachments.
    const { attachment_url, attachment_name } = await applyAttachmentChanges(
      req,
      NOTE_TYPE,
      UPLOAD_FOLDER,
      existingNote
    );

    const noteData = {
      title,
      content,
      priority,
      due_date: due_date || null,
      is_completed: is_completed === "true" || is_completed === true,
      attachment_url,
      attachment_name,
    };

    const updated = await GeneralNoteModel.update(noteId, noteData);

    if (!updated) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to update note" });
    }

    const updatedNote = await GeneralNoteModel.getById(noteId);
    res.json({ success: true, data: await withAttachments(updatedNote) });
  } catch (error) {
    console.error("Error updating general note:", error);
    res.status(500).json({ success: false, error: "Failed to update note" });
  }
};

const toggleNoteComplete = async (req, res) => {
  try {
    const { noteId } = req.params;

    const toggled = await GeneralNoteModel.toggleComplete(noteId);

    if (!toggled) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    const updatedNote = await GeneralNoteModel.getById(noteId);
    res.json({ success: true, data: await withAttachments(updatedNote) });
  } catch (error) {
    console.error("Error toggling general note:", error);
    res.status(500).json({ success: false, error: "Failed to toggle note" });
  }
};

const toggleNotePin = async (req, res) => {
  try {
    const { noteId } = req.params;

    const toggled = await GeneralNoteModel.togglePin(noteId);

    if (!toggled) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    const updatedNote = await GeneralNoteModel.getById(noteId);
    res.json({ success: true, data: await withAttachments(updatedNote) });
  } catch (error) {
    if (error && error.code === "PIN_COLUMNS_MISSING") {
      return res.status(409).json({
        success: false,
        error:
          "Pinning is not available until the database is migrated (missing is_pinned/pinned_at).",
      });
    }
    console.error("Error pinning general note:", error);
    res.status(500).json({ success: false, error: "Failed to pin note" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await GeneralNoteModel.getById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    await deleteAllAttachments(NOTE_TYPE, note);

    const deleted = await GeneralNoteModel.delete(noteId);

    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to delete note" });
    }

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting general note:", error);
    res.status(500).json({ success: false, error: "Failed to delete note" });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  toggleNoteComplete,
  toggleNotePin,
  deleteNote,
};
