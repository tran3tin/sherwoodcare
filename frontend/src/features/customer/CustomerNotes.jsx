import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { customerNoteService } from "../../services/customerNoteService";
import { customerService } from "../../services/customerService";
import "../../assets/styles/list.css";
import "./CustomerNotes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CustomerNotes() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    due_date: "",
  });

  useEffect(() => {
    loadCustomer();
    loadNotes();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const response = await customerService.getById(customerId);
      setCustomer(response.data);
    } catch (error) {
      console.error("Error loading customer:", error);
      toast.error("Failed to load customer info");
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await customerNoteService.getByCustomerId(customerId);
      setNotes(response.data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || "",
        priority: note.priority || "medium",
        due_date: note.due_date ? note.due_date.split("T")[0] : "",
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        due_date: "",
      });
    }
    setSelectedFile(null);
    setRemoveAttachment(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setSelectedFile(null);
    setRemoveAttachment(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning("Please enter a title");
      return;
    }

    try {
      if (editingNote) {
        await customerNoteService.update(
          editingNote.note_id,
          { ...formData, is_completed: editingNote.is_completed },
          selectedFile,
          removeAttachment
        );
        toast.success("Note updated successfully");
      } else {
        await customerNoteService.create(
          { ...formData, customer_id: customerId },
          selectedFile
        );
        toast.success("Note created successfully");
      }

      handleCloseModal();
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleToggleComplete = async (noteId) => {
    try {
      await customerNoteService.toggleComplete(noteId);
      loadNotes();
    } catch (error) {
      console.error("Error toggling note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await customerNoteService.delete(noteId);
      toast.success("Note deleted");
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setRemoveAttachment(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (filter === "pending") return !note.is_completed;
    if (filter === "completed") return note.is_completed;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const isOverdue = (dueDate, isCompleted) => {
    if (!dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const pendingCount = notes.filter((n) => !n.is_completed).length;
  const completedCount = notes.filter((n) => n.is_completed).length;

  if (loading) {
    return (
      <Layout
        title="Customer Notes"
        breadcrumb={["Home", "Customers", "Notes"]}
      >
        <div className="loading-spinner">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Notes" breadcrumb={["Home", "Customers", "Notes"]}>
      <div className="customer-notes-container">
        {/* Header */}
        <div className="notes-header">
          <div className="notes-header-left">
            <h2>
              Notes for: {customer?.business_name || customer?.contact_name}
            </h2>
            <div className="notes-stats">
              <span className="stat pending">{pendingCount} Pending</span>
              <span className="stat completed">{completedCount} Completed</span>
            </div>
          </div>
          <div className="notes-header-right">
            <button
              className="btn-action btn-cancel"
              onClick={() => navigate("/customers")}
              title="Back to Customers"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <button
              className="btn-action btn-save"
              onClick={() => handleOpenModal()}
              title="Add Note"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notes-filter">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notes.length})
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Notes List */}
        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <div className="no-notes">
              <i className="fas fa-sticky-note"></i>
              <p>No notes found. Click + to add a new note.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.note_id}
                className={`note-card ${note.is_completed ? "completed" : ""} ${
                  isOverdue(note.due_date, note.is_completed) ? "overdue" : ""
                }`}
              >
                <div className="note-checkbox">
                  <input
                    type="checkbox"
                    checked={note.is_completed}
                    onChange={() => handleToggleComplete(note.note_id)}
                  />
                </div>

                <div className="note-content">
                  <div className="note-header">
                    <h4 className="note-title">{note.title}</h4>
                    <span
                      className="note-priority"
                      style={{
                        backgroundColor: getPriorityColor(note.priority),
                      }}
                    >
                      {note.priority}
                    </span>
                  </div>

                  {note.content && (
                    <p className="note-description">{note.content}</p>
                  )}

                  <div className="note-meta">
                    {note.due_date && (
                      <span
                        className={`note-due ${
                          isOverdue(note.due_date, note.is_completed)
                            ? "overdue"
                            : ""
                        }`}
                      >
                        <i className="fas fa-calendar"></i>
                        {formatDate(note.due_date)}
                      </span>
                    )}

                    {note.attachment_url && (
                      <a
                        href={`${API_URL}${note.attachment_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="note-attachment"
                      >
                        <i className="fas fa-paperclip"></i>
                        {note.attachment_name || "Attachment"}
                      </a>
                    )}

                    <span className="note-created">
                      Created: {formatDate(note.created_at)}
                    </span>
                  </div>
                </div>

                <div className="note-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleOpenModal(note)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(note.note_id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingNote ? "Edit Note" : "Add New Note"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter note title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter note description"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Due date
                    <i
                      className="fas fa-info-circle"
                      style={{
                        marginLeft: "5px",
                        fontSize: "12px",
                        color: "#007bff",
                        cursor: "help",
                      }}
                      title="Select a date to receive notification reminder for this note"
                    ></i>
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    placeholder="Select notification date"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Attachment (Image/File - Max 10MB)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                {selectedFile && (
                  <div className="selected-file">
                    <i className="fas fa-file"></i> {selectedFile.name}
                    <button type="button" onClick={() => setSelectedFile(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}

                {editingNote?.attachment_url && !selectedFile && (
                  <div className="existing-attachment">
                    <a
                      href={`${API_URL}${editingNote.attachment_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-paperclip"></i>
                      {editingNote.attachment_name || "Current attachment"}
                    </a>
                    <label className="remove-attachment">
                      <input
                        type="checkbox"
                        checked={removeAttachment}
                        onChange={(e) => setRemoveAttachment(e.target.checked)}
                      />
                      Remove attachment
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNote ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
