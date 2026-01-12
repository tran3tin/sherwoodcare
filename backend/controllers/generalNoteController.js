const GeneralNoteModel = require("../models/GeneralNoteModel");
const path = require("path");
const fs = require("fs");

const getAllNotes = async (req, res) => {
  try {
    const notes = await GeneralNoteModel.getAll();
    res.json({ success: true, data: notes });
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

    res.json({ success: true, data: note });
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

    let attachment_url = null;
    let attachment_name = null;

    if (req.file) {
      attachment_url = `/uploads/general-notes/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const noteData = {
      title,
      content: content || "",
      priority: priority || "medium",
      due_date: due_date || null,
      attachment_url,
      attachment_name,
    };

    const newNote = await GeneralNoteModel.create(noteData);
    res.status(201).json({ success: true, data: newNote });
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

    let attachment_url = existingNote.attachment_url;
    let attachment_name = existingNote.attachment_name;

    if (req.file) {
      if (existingNote.attachment_url) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          existingNote.attachment_url
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      attachment_url = `/uploads/general-notes/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    if (req.body.remove_attachment === "true") {
      if (existingNote.attachment_url) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "public",
          existingNote.attachment_url
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      attachment_url = null;
      attachment_name = null;
    }

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
    res.json({ success: true, data: updatedNote });
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
    res.json({ success: true, data: updatedNote });
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
    res.json({ success: true, data: updatedNote });
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

    if (note.attachment_url) {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        note.attachment_url
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

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
