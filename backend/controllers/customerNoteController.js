const CustomerNoteModel = require("../models/CustomerNoteModel");
const path = require("path");
const fs = require("fs");

// Get all notes for a customer
const getNotesByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const notes = await CustomerNoteModel.getByCustomerId(customerId);
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error("Error fetching customer notes:", error);
    res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
};

// Get single note
const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await CustomerNoteModel.getById(noteId);

    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    res.json({ success: true, data: note });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ success: false, error: "Failed to fetch note" });
  }
};

// Create new note
const createNote = async (req, res) => {
  try {
    const { customer_id, title, content, priority, due_date } = req.body;

    if (!customer_id || !title) {
      return res
        .status(400)
        .json({ success: false, error: "Customer ID and title are required" });
    }

    let attachment_url = null;
    let attachment_name = null;

    // Handle file upload
    if (req.file) {
      attachment_url = `/uploads/customer-notes/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const noteData = {
      customer_id,
      title,
      content: content || "",
      priority: priority || "medium",
      due_date: due_date || null,
      attachment_url,
      attachment_name,
    };

    const newNote = await CustomerNoteModel.create(noteData);
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ success: false, error: "Failed to create note" });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, priority, due_date, is_completed } = req.body;

    // Get existing note to preserve attachment if not updating
    const existingNote = await CustomerNoteModel.getById(noteId);
    if (!existingNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    let attachment_url = existingNote.attachment_url;
    let attachment_name = existingNote.attachment_name;

    // Handle new file upload
    if (req.file) {
      // Delete old file if exists
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
      attachment_url = `/uploads/customer-notes/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    // Check if user wants to remove attachment
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

    const updated = await CustomerNoteModel.update(noteId, noteData);

    if (!updated) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to update note" });
    }

    const updatedNote = await CustomerNoteModel.getById(noteId);
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ success: false, error: "Failed to update note" });
  }
};

// Toggle completion status
const toggleNoteComplete = async (req, res) => {
  try {
    const { noteId } = req.params;

    const toggled = await CustomerNoteModel.toggleComplete(noteId);

    if (!toggled) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    const updatedNote = await CustomerNoteModel.getById(noteId);
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error("Error toggling note:", error);
    res.status(500).json({ success: false, error: "Failed to toggle note" });
  }
};

// Toggle pin status
const toggleNotePin = async (req, res) => {
  try {
    const { noteId } = req.params;

    const toggled = await CustomerNoteModel.togglePin(noteId);

    if (!toggled) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    const updatedNote = await CustomerNoteModel.getById(noteId);
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    console.error("Error pinning note:", error);
    res.status(500).json({ success: false, error: "Failed to pin note" });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    // Get note to delete attachment file
    const note = await CustomerNoteModel.getById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    // Delete attachment file if exists
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

    const deleted = await CustomerNoteModel.delete(noteId);

    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to delete note" });
    }

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ success: false, error: "Failed to delete note" });
  }
};

// Get notes count for a customer
const getNotesCount = async (req, res) => {
  try {
    const { customerId } = req.params;
    const count = await CustomerNoteModel.getCountByCustomerId(customerId);
    res.json({ success: true, data: count });
  } catch (error) {
    console.error("Error fetching notes count:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch notes count" });
  }
};

module.exports = {
  getNotesByCustomerId,
  getNoteById,
  createNote,
  updateNote,
  toggleNoteComplete,
  toggleNotePin,
  deleteNote,
  getNotesCount,
};
