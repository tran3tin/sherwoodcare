import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Layout from "../../components/Layout";
import "../../assets/styles/list.css";
import "../customer/CustomerNotes.css";
import "./FullNotes.css";

import { fullNoteService } from "../../services/fullNoteService";
import { customerNoteService } from "../../services/customerNoteService";
import { employeeNoteService } from "../../services/employeeNoteService";
import { customerService } from "../../services/customerService";
import { employeeService } from "../../services/employeeService";
import { API_BASE_URL } from "../../config/api";

export default function FullNotes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, completed
  const [typeFilter, setTypeFilter] = useState("all"); // all, customer, employee

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  const [pinAvailable, setPinAvailable] = useState(true);

  const [formData, setFormData] = useState({
    note_type: "customer",
    entity_id: "",
    title: "",
    content: "",
    priority: "medium",
    due_date: "",
  });

  const loadNotes = async (opts = {}) => {
    try {
      setLoading(true);
      const response = await fullNoteService.getAll({
        status: opts.status ?? statusFilter,
        type: opts.type ?? typeFilter,
      });
      setNotes(response.data || []);
    } catch (error) {
      console.error("Error loading full notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const [customerResp, employeeResp] = await Promise.all([
        customerService.getAll(),
        employeeService.getAll(),
      ]);

      setCustomers(customerResp?.data || []);
      setEmployees(employeeResp?.data || []);
    } catch (error) {
      console.error("Error loading customers/employees:", error);
      // Not fatal for viewing notes; creation dropdown just won't have data.
    }
  };

  useEffect(() => {
    loadNotes();
    loadEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadNotes({ status: statusFilter, type: typeFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const pending = notes.filter((n) => !n.is_completed).length;
    const completed = notes.filter((n) => n.is_completed).length;
    return { total: notes.length, pending, completed };
  }, [notes]);

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
    return date.toLocaleDateString("en-GB");
  };

  const isOverdue = (dueDate, isCompleted) => {
    if (!dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        note_type: note.note_type,
        entity_id: String(note.entity_id ?? ""),
        title: note.title,
        content: note.content || "",
        priority: note.priority || "medium",
        due_date: note.due_date ? note.due_date.split("T")[0] : "",
      });
    } else {
      setEditingNote(null);
      setFormData({
        note_type: "customer",
        entity_id: "",
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

  const getNoteService = (noteType) => {
    return noteType === "employee" ? employeeNoteService : customerNoteService;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning("Please enter a title");
      return;
    }

    if (!editingNote && !formData.entity_id) {
      toast.warning("Please select a customer/employee");
      return;
    }

    try {
      const service = getNoteService(formData.note_type);

      if (editingNote) {
        await service.update(
          editingNote.note_id,
          { ...formData, is_completed: editingNote.is_completed },
          selectedFile,
          removeAttachment
        );
        toast.success("Note updated successfully");
      } else {
        const payload = {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          due_date: formData.due_date || "",
        };

        if (formData.note_type === "customer") {
          await service.create(
            { ...payload, customer_id: formData.entity_id },
            selectedFile
          );
        } else {
          await service.create(
            { ...payload, employee_id: formData.entity_id },
            selectedFile
          );
        }

        toast.success("Note created successfully");
      }

      handleCloseModal();
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleToggleComplete = async (note) => {
    try {
      const service = getNoteService(note.note_type);
      await service.toggleComplete(note.note_id);
      loadNotes();
    } catch (error) {
      console.error("Error toggling note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const service = getNoteService(note.note_type);
      await service.togglePin(note.note_id);
      loadNotes();
    } catch (error) {
      console.error("Error pinning note:", error);
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.error;

      if (status === 409) {
        setPinAvailable(false);
        toast.warning(
          apiMessage ||
            "Pinning is not available until the database is migrated."
        );
        return;
      }

      toast.error(apiMessage || "Failed to pin note");
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const service = getNoteService(note.note_type);
      await service.delete(note.note_id);
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

  const entityOptions = useMemo(() => {
    if (formData.note_type === "employee") {
      return employees.map((e) => ({
        id: e.employee_id,
        label: e.preferred_name || `${e.first_name} ${e.last_name}`,
      }));
    }
    return customers.map((c) => ({
      id: c.customer_id,
      label: c.full_name || c.business_name || c.contact_name || "(Unnamed)",
    }));
  }, [customers, employees, formData.note_type]);

  if (loading) {
    return (
      <Layout
        title="Full Notes"
        breadcrumb={["Home", "Dashboard", "Full Notes"]}
      >
        <div className="loading-spinner">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Full Notes" breadcrumb={["Home", "Dashboard", "Full Notes"]}>
      <div className="customer-notes-container">
        <div className="notes-header">
          <div className="notes-header-left">
            <h2>All Notes</h2>
            <div className="notes-stats">
              <span className="stat pending">{stats.pending} Pending</span>
              <span className="stat completed">
                {stats.completed} Completed
              </span>
            </div>
          </div>

          <div className="notes-header-right">
            <button
              className="btn-action btn-cancel"
              onClick={() => navigate("/")}
              title="Back"
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

        <div className="full-notes-filters">
          <div className="notes-filter">
            <button
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "pending" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({stats.pending})
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "completed" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed ({stats.completed})
            </button>
          </div>

          <div className="notes-filter type-filter">
            <button
              className={`filter-btn ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All Types
            </button>
            <button
              className={`filter-btn ${
                typeFilter === "customer" ? "active" : ""
              }`}
              onClick={() => setTypeFilter("customer")}
            >
              Customer
            </button>
            <button
              className={`filter-btn ${
                typeFilter === "employee" ? "active" : ""
              }`}
              onClick={() => setTypeFilter("employee")}
            >
              Employee
            </button>
          </div>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="no-notes">
              <i className="fas fa-sticky-note"></i>
              <p>No notes found. Click + to add a new note.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={`${note.note_type}-${note.note_id}`}
                className={`note-card ${note.is_completed ? "completed" : ""} ${
                  isOverdue(note.due_date, note.is_completed) ? "overdue" : ""
                } ${note.is_pinned ? "pinned" : ""}`}
              >
                <div className="note-checkbox">
                  <input
                    type="checkbox"
                    checked={note.is_completed}
                    onChange={() => handleToggleComplete(note)}
                  />
                </div>

                <div className="note-content">
                  <div className="note-header">
                    <h4 className="note-title">
                      {note.title}
                      {note.is_pinned && (
                        <span className="note-pin-badge" title="Pinned">
                          <i className="fas fa-thumbtack"></i>
                        </span>
                      )}
                    </h4>
                    <span
                      className="note-priority"
                      style={{
                        backgroundColor: getPriorityColor(note.priority),
                      }}
                    >
                      {note.priority}
                    </span>
                  </div>

                  <div className="note-source">
                    <span className={`source-badge ${note.note_type}`}>
                      {note.note_type === "customer" ? "Customer" : "Employee"}
                    </span>
                    <button
                      type="button"
                      className="source-link"
                      onClick={() =>
                        navigate(
                          note.note_type === "customer"
                            ? `/customer/${note.entity_id}/notes`
                            : `/employee/${note.entity_id}/notes`
                        )
                      }
                      title="Open notes"
                    >
                      {note.entity_name || `#${note.entity_id}`}
                    </button>
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
                        href={`${API_BASE_URL}${note.attachment_url}`}
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
                    className={`btn-icon btn-pin ${
                      note.is_pinned ? "active" : ""
                    }`}
                    onClick={() => handleTogglePin(note)}
                    disabled={!pinAvailable}
                    title={
                      !pinAvailable
                        ? "Pinning requires database migration"
                        : note.is_pinned
                        ? "Unpin"
                        : "Pin"
                    }
                  >
                    <i className="fas fa-thumbtack"></i>
                  </button>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleOpenModal(note)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(note)}
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
              <div className="form-row full-notes-modal-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.note_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        note_type: e.target.value,
                        entity_id: "",
                      }))
                    }
                    disabled={!!editingNote}
                  >
                    <option value="customer">Customer</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    {formData.note_type === "customer"
                      ? "Customer"
                      : "Employee"}{" "}
                    *
                  </label>
                  <select
                    value={formData.entity_id}
                    onChange={(e) =>
                      setFormData({ ...formData, entity_id: e.target.value })
                    }
                    required={!editingNote}
                    disabled={!!editingNote}
                  >
                    <option value="">Select...</option>
                    {entityOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  <label>Due date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
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
                      href={`${API_BASE_URL}${editingNote.attachment_url}`}
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
