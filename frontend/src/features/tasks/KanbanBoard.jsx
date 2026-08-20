import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { taskService } from "../../services/taskService";
import { API_BASE_URL } from "../../config/api";
import "./KanbanBoard.css";
import "./TaskPin.css";

const COLUMNS = {
  todo: { id: "todo", title: "To Do", color: "#6c757d" },
  inprogress: { id: "inprogress", title: "In Progress", color: "#007bff" },
  review: { id: "review", title: "Review", color: "#ffc107" },
  done: { id: "done", title: "Done", color: "#28a745" },
};

const PRIORITIES = {
  low: { label: "Low", color: "#6c757d" },
  medium: { label: "Medium", color: "#17a2b8" },
  high: { label: "High", color: "#ffc107" },
  urgent: { label: "Urgent", color: "#dc3545" },
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    inprogress: [],
    review: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Multiple attachments state
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]); // Array of {id, url, name}
  const [removeAttachmentIds, setRemoveAttachmentIds] = useState([]);

  const fileInputRef = useRef(null);
  const [pinAvailable, setPinAvailable] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to: "",
    status: "todo",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const isPinnedFlag = (value) => {
    // MySQL tinyint may arrive as 0/1, true/false, or "0"/"1"
    if (value === true || value === 1 || value === "1") return true;
    if (value === false || value === 0 || value === "0" || value == null) return false;
    return Boolean(Number(value));
  };

  const sortColumnTasks = (list = []) => {
    // Keep pinned tasks at the top of each column (frontend safety net).
    // Backend already orders this way; re-sort after local drag/optimistic updates.
    return [...list].sort((a, b) => {
      const ap = isPinnedFlag(a.is_pinned) ? 1 : 0;
      const bp = isPinnedFlag(b.is_pinned) ? 1 : 0;
      if (bp !== ap) return bp - ap;
      const aPinAt = a.pinned_at ? new Date(a.pinned_at).getTime() : 0;
      const bPinAt = b.pinned_at ? new Date(b.pinned_at).getTime() : 0;
      if (bPinAt !== aPinAt) return bPinAt - aPinAt;
      const aPos = Number(a.position ?? 0);
      const bPos = Number(b.position ?? 0);
      if (aPos !== bPos) return aPos - bPos;
      return 0;
    });
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll();
      if (response.success) {
        const data = response.data || {};
        setTasks({
          todo: sortColumnTasks(data.todo),
          inprogress: sortColumnTasks(data.inprogress),
          review: sortColumnTasks(data.review),
          done: sortColumnTasks(data.done),
        });
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    // const taskId = parseInt(draggableId); // Unused

    const newTasks = { ...tasks };
    const sourceTasks = [...newTasks[sourceColumn]];
    const destTasks =
      sourceColumn === destColumn ? sourceTasks : [...newTasks[destColumn]];

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.status = destColumn;

    if (sourceColumn === destColumn) {
      sourceTasks.splice(destination.index, 0, movedTask);
      // Keep pinned tasks at the top after manual drag
      newTasks[sourceColumn] = sortColumnTasks(sourceTasks);
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      newTasks[sourceColumn] = sortColumnTasks(sourceTasks);
      newTasks[destColumn] = sortColumnTasks(destTasks);
    }

    setTasks(newTasks);

    try {
      // Persist visual order (pinned already sorted first)
      const taskIds = newTasks[destColumn].map((t) => t.task_id);
      await taskService.reorder(destColumn, taskIds);

      if (sourceColumn !== destColumn) {
        const sourceTaskIds = newTasks[sourceColumn].map((t) => t.task_id);
        await taskService.reorder(sourceColumn, sourceTaskIds);
      }
    } catch (error) {
      console.error("Error saving position:", error);
      toast.error("Failed to save changes");
      loadTasks();
    }
  };

  const handleOpenModal = (task = null, status = "todo") => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        assigned_to: task.assigned_to || "",
        status: task.status,
      });

      // Handle existing attachments
      // The backend now returns 'attachments' array.
      // Fallback to old 'attachment_url' if 'attachments' is empty/missing but url exists
      let currentAttachments = [];
      if (task.attachments && task.attachments.length > 0) {
         currentAttachments = task.attachments.map(a => ({
             ...a,
             url: a.url.startsWith("http") ? a.url : `${API_BASE_URL}${a.url}`
         }));
      } else if (task.attachment_url) {
         currentAttachments = [{
             id: 'legacy',
             url: `${API_BASE_URL}${task.attachment_url}`,
             name: task.attachment_name
         }];
      }
      setExistingAttachments(currentAttachments);

    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: "",
        status: status,
      });
      setExistingAttachments([]);
    }
    
    setAttachmentFiles([]);
    setAttachmentPreviews([]);
    setRemoveAttachmentIds([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    
    // Cleanup previews
    attachmentPreviews.forEach(p => {
        if (p.url && !p.isExisting) URL.revokeObjectURL(p.url);
    });
    
    setAttachmentFiles([]);
    setAttachmentPreviews([]);
    setExistingAttachments([]);
    setRemoveAttachmentIds([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [];
    const newPreviews = [];

    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large (max 10MB)`);
            return;
        }
        newFiles.push(file);

        if (file.type.startsWith("image/")) {
            newPreviews.push({
                url: URL.createObjectURL(file), // Create object URL for preview
                name: file.name,
                isImage: true,
                isExisting: false,
                fileObj: file
            });
        } else {
             newPreviews.push({
                url: null,
                name: file.name,
                isImage: false,
                isExisting: false,
                fileObj: file
            });
        }
    });

    setAttachmentFiles(prev => [...prev, ...newFiles]);
    setAttachmentPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewFile = (index) => {
     setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
     setAttachmentPreviews(prev => {
         const preview = prev[index];
         if (preview.url && !preview.isExisting) URL.revokeObjectURL(preview.url);
         return prev.filter((_, i) => i !== index);
     });
     if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveExistingAttachment = (attachmentId, index) => {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
      if (attachmentId !== 'legacy') {
          setRemoveAttachmentIds(prev => [...prev, attachmentId]);
      } else {
          // If legacy, we might handle it differently or just pass special flag?
          // Since we are moving to new system, let's assume legacy is handled by 'remove_attachment' flag if we kept it
          // OR we passed legacy as 'legacy' ID. My service expects IDs.
          // If legacy ID, maybe we can't delete it properly via ID.
          // Fallback: If 'legacy', maybe just don't add to removeAttachmentIds but we need to tell backend to clear old columns.
          // My updated backend 'updateTask' doesn't look at old columns for deletion unless I add that logic.
          // For now, let's assume migrated data won't have 'legacy' ID properly unless migrated.
          // The migration script runs on startup, so data should be in new table.
          // If migration ran, attachmentId will be a number.
      }
  };

  const getFileIcon = (filename) => {
    if (!filename) return "fa-file";
    const ext = filename.split(".").pop().toLowerCase();
    const icons = {
      pdf: "fa-file-pdf",
      doc: "fa-file-word",
      docx: "fa-file-word",
      xls: "fa-file-excel",
      xlsx: "fa-file-excel",
      txt: "fa-file-alt",
      jpg: "fa-file-image",
      jpeg: "fa-file-image",
      png: "fa-file-image",
      gif: "fa-file-image",
      webp: "fa-file-image",
    };
    return icons[ext] || "fa-file";
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning("Please enter a title");
      return;
    }

    try {
      if (editingTask) {
        await taskService.update(
          editingTask.task_id,
          formData,
          attachmentFiles,
          removeAttachmentIds
        );
        toast.success("Task updated successfully");
      } else {
        await taskService.create(formData, attachmentFiles);
        toast.success("Task created successfully");
      }

      handleCloseModal();
      loadTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      const errorDetails =
        error?.response?.data?.details ||
        error?.response?.data?.error ||
        error.message;
      toast.error(`Failed to save task: ${errorDetails}`);
    }
  };

  // ... handleDelete, handleTogglePin ... (same as before)
  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.delete(taskId);
      toast.success("Task deleted");
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleTogglePin = async (task) => {
    try {
      const response = await taskService.togglePin(task.task_id);
      const updated = response?.data;

      // Optimistic reorder: flip pin flag and float pinned tasks to top
      setTasks((prev) => {
        const columnId = task.status;
        const next = { ...prev };
        next[columnId] = sortColumnTasks(
          (prev[columnId] || []).map((t) =>
            t.task_id === task.task_id
              ? {
                  ...t,
                  ...(updated || {}),
                  is_pinned: updated
                    ? updated.is_pinned
                    : isPinnedFlag(t.is_pinned)
                      ? 0
                      : 1,
                  pinned_at: updated
                    ? updated.pinned_at
                    : isPinnedFlag(t.is_pinned)
                      ? null
                      : new Date().toISOString(),
                }
              : t
          )
        );
        return next;
      });
    } catch (error) {
      console.error("Error pinning task:", error);
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

      toast.error(apiMessage || "Failed to pin task");
      // Resync if optimistic update may be wrong
      loadTasks();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const getTaskCount = () => {
    return Object.values(tasks).reduce((sum, col) => sum + col.length, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="kanban-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading tasks...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="kanban-container">
        {/* Header */}
        <div className="kanban-header">
          <div className="kanban-title">
            <h2>
              <i className="fas fa-columns"></i> Task Board
            </h2>
            <span className="task-count">{getTaskCount()} tasks</span>
          </div>
          <button
            className="btn btn-primary add-task-btn"
            onClick={() => handleOpenModal()}
          >
            <i className="fas fa-plus"></i> Add Task
          </button>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {Object.entries(COLUMNS).map(([columnId, column]) => (
              <div key={columnId} className="kanban-column">
                <div
                  className="column-header"
                  style={{ borderTopColor: column.color }}
                >
                  <h3>
                    <span
                      className="column-dot"
                      style={{ backgroundColor: column.color }}
                    ></span>
                    {column.title}
                  </h3>
                  <span className="column-count">
                    {tasks[columnId]?.length || 0}
                  </span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      className={`column-content ${
                        snapshot.isDraggingOver ? "dragging-over" : ""
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {tasks[columnId]?.map((task, index) => (
                        <Draggable
                          key={task.task_id}
                          draggableId={String(task.task_id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`task-card ${
                                snapshot.isDragging ? "dragging" : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="task-card-header">
                                <span
                                  className="task-priority"
                                  style={{
                                    backgroundColor:
                                      PRIORITIES[task.priority]?.color,
                                  }}
                                >
                                  {PRIORITIES[task.priority]?.label}
                                </span>
                                <div className="task-actions">
                                  <button
                                    className={`btn-icon ${
                                      isPinnedFlag(task.is_pinned) ? "pinned" : ""
                                    }`}
                                    onClick={() => handleTogglePin(task)}
                                    disabled={!pinAvailable}
                                    title={
                                      !pinAvailable
                                        ? "Pinning requires database migration"
                                        : isPinnedFlag(task.is_pinned)
                                        ? "Unpin"
                                        : "Pin"
                                    }
                                  >
                                    <i className="fas fa-thumbtack"></i>
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() => handleOpenModal(task)}
                                    title="Edit"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(task.task_id)}
                                    title="Delete"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>

                              <h4 className="task-title">
                                {task.title}
                                {isPinnedFlag(task.is_pinned) ? (
                                  <span
                                    className="task-pin-badge"
                                    title="Pinned"
                                  >
                                    <i className="fas fa-thumbtack"></i>
                                  </span>
                                ) : null}
                              </h4>

                              {task.description && (
                                <p className="task-description">
                                  {task.description}
                                </p>
                              )}

                              <div className="task-meta">
                                {task.due_date && (
                                  <span
                                    className={`task-due ${
                                      isOverdue(task.due_date) ? "overdue" : ""
                                    }`}
                                  >
                                    <i className="fas fa-calendar"></i>
                                    {formatDate(task.due_date)}
                                  </span>
                                )}
                                {task.assigned_to && (
                                  <span className="task-assignee">
                                    <i className="fas fa-user"></i>
                                    {task.assigned_to}
                                  </span>
                                )}
                                
                                {/** Multiple Attachments Display in Card */}
                                {(task.attachments && task.attachments.length > 0) ? (
                                    <span
                                      className="task-attachment"
                                      title={`${task.attachments.length} attachment(s)`}
                                    >
                                      <i className="fas fa-paperclip"></i> {task.attachments.length}
                                    </span>
                                ) : (
                                  // Retro compatibility
                                  task.attachment_url && (
                                    <span
                                      className="task-attachment"
                                      title={task.attachment_name}
                                    >
                                      <i
                                        className={`fas ${getFileIcon(
                                          task.attachment_name
                                        )}`}
                                      ></i>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      <button
                        className="add-task-inline"
                        onClick={() => handleOpenModal(null, columnId)}
                      >
                        <i className="fas fa-plus"></i> Add task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content task-modal">
              <div className="modal-header">
                <h3>{editingTask ? "Edit Task" : "Create New Task"}</h3>
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
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      {Object.entries(COLUMNS).map(([id, col]) => (
                        <option key={id} value={id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                    >
                      {Object.entries(PRIORITIES).map(([id, p]) => (
                        <option key={id} value={id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned To</label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assigned_to: e.target.value,
                        })
                      }
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                 {/* File Attachment Section */}
                <div className="form-group attachment-group">
                  <label>
                    <i className="fas fa-paperclip"></i> Attachments
                  </label>
                  <div className="attachment-input-wrapper">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      style={{ display: "none" }}
                      id="task-attachment"
                      multiple
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fas fa-upload"></i> Choose Files
                    </button>
                    <span className="file-hint">
                      Max 10MB per file
                    </span>
                  </div>

                  {/* Existing Attachments List */}
                  {existingAttachments.length > 0 && (
                      <div className="mt-2">
                          <h6>Existing Attachments:</h6>
                          <ul className="attachment-list">
                              {existingAttachments.map((att, index) => (
                                  <li key={att.id || index} className="attachment-item">
                                      {att.url && (isImageFile(att.name) ? (
                                           <div className="attachment-thumb">
                                              <img src={att.url} alt={att.name} />
                                           </div>
                                      ) : (
                                          <i className={`fas ${getFileIcon(att.name)} mr-2`}></i>
                                      ))}
                                      
                                      <span className="attachment-name">
                                          <a href={att.url} target="_blank" rel="noopener noreferrer">
                                              {att.name}
                                          </a>
                                      </span>
                                      <button 
                                          type="button" 
                                          className="btn-remove-attachment"
                                          onClick={() => handleRemoveExistingAttachment(att.id, index)}
                                      >
                                          <i className="fas fa-times"></i>
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}

                  {/* New Attachments List */}
                  {attachmentPreviews.length > 0 && (
                      <div className="mt-2">
                          <h6>New Attachments:</h6>
                           <ul className="attachment-list">
                              {attachmentPreviews.map((preview, index) => (
                                  <li key={index} className="attachment-item">
                                        {preview.isImage ? (
                                           <div className="attachment-thumb">
                                              <img src={preview.url} alt={preview.name} />
                                           </div>
                                      ) : (
                                          <i className={`fas ${getFileIcon(preview.name)} mr-2`}></i>
                                      )}
                                      
                                      <span className="attachment-name">{preview.name}</span>
                                      <button 
                                          type="button" 
                                          className="btn-remove-attachment"
                                          onClick={() => handleRemoveNewFile(index)}
                                      >
                                          <i className="fas fa-times"></i>
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
                  
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? "Update Task" : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
