const TaskModel = require("../models/TaskModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      __dirname,
      "../public/uploads/task-attachments",
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `task-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images and common document types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getAll();

    // Group tasks by status
    const grouped = {
      todo: tasks.filter((t) => t.status === "todo"),
      inprogress: tasks.filter((t) => t.status === "inprogress"),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, error: "Failed to fetch tasks" });
  }
};

// Get single task
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await TaskModel.getById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ success: false, error: "Failed to fetch task" });
  }
};

// Helper function to convert empty strings to null
const toNullIfEmpty = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return value;
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assigned_to } =
      req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    // Handle file upload
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        files.push({
          url: `/uploads/task-attachments/${file.filename}`,
          name: file.originalname,
        });
      });
    }

    // Convert empty strings to null for database compatibility (PostgreSQL DATE type)
    const taskData = {
      title: title.trim(),
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      due_date: toNullIfEmpty(due_date),
      assigned_to: toNullIfEmpty(assigned_to),
      files,
    };

    console.log("Creating task with data:", JSON.stringify(taskData, null, 2));

    const newTask = await TaskModel.create(taskData);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    console.error("Error stack:", error.stack);
    // Return actual error for debugging
    res.status(500).json({
      success: false,
      error: "Failed to create task",
      details: error.message,
      hint: error.hint || null,
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
      position,
      remove_attachment_ids,
    } = req.body;

    const existingTask = await TaskModel.getById(taskId);
    if (!existingTask) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Handle removal of attachments
    if (remove_attachment_ids) {
      try {
        const ids = JSON.parse(remove_attachment_ids);
        if (Array.isArray(ids)) {
          for (const id of ids) {
            await TaskModel.removeAttachment(id);
          }
        }
      } catch (e) {
        console.error("Error processing remove_attachment_ids", e);
      }
    }

    // Handle new files
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        files.push({
          url: `/uploads/task-attachments/${file.filename}`,
          name: file.originalname,
        });
      });
    }

    const taskData = {
      title: title ? title.trim() : existingTask.title,
      description:
        description !== undefined ? description : existingTask.description,
      status: status || existingTask.status,
      priority: priority || existingTask.priority,
      due_date:
        due_date !== undefined
          ? toNullIfEmpty(due_date)
          : existingTask.due_date,
      assigned_to:
        assigned_to !== undefined
          ? toNullIfEmpty(assigned_to)
          : existingTask.assigned_to,
      position: position !== undefined ? position : existingTask.position,
      files,
    };

    console.log("Updating task with data:", JSON.stringify(taskData, null, 2));

    const updated = await TaskModel.update(taskId, taskData);

    if (!updated) {
      console.error("TaskModel.update returned false for taskId:", taskId);
      return res.status(400).json({
        success: false,
        error: "Failed to update task - no rows affected",
      });
    }

    const updatedTask = await TaskModel.getById(taskId);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to update task",
      details: error.message,
      hint: error.hint || null,
    });
  }
};

// Update task position (drag & drop)
const updateTaskPosition = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, position } = req.body;

    const updated = await TaskModel.updatePosition(taskId, status, position);

    if (!updated) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to update position" });
    }

    res.json({ success: true, message: "Position updated" });
  } catch (error) {
    console.error("Error updating position:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update position" });
  }
};

// Reorder tasks in a column
const reorderTasks = async (req, res) => {
  try {
    const { status, taskIds } = req.body;

    if (!status || !taskIds || !Array.isArray(taskIds)) {
      return res
        .status(400)
        .json({ success: false, error: "Status and taskIds are required" });
    }

    await TaskModel.reorderTasks(status, taskIds);
    res.json({ success: true, message: "Tasks reordered" });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ success: false, error: "Failed to reorder tasks" });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TaskModel.getById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Delete attachment file if exists
    if (task.attachment_url) {
      const filePath = path.join(__dirname, "../public", task.attachment_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const deleted = await TaskModel.delete(taskId);

    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to delete task" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, error: "Failed to delete task" });
  }
};

// Get task counts
const getTaskCounts = async (req, res) => {
  try {
    const counts = await TaskModel.getCountByStatus();
    res.json({ success: true, data: counts });
  } catch (error) {
    console.error("Error fetching task counts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch counts" });
  }
};

// Toggle task pin
const toggleTaskPin = async (req, res) => {
  try {
    const { taskId } = req.params;

    const toggled = await TaskModel.togglePin(taskId);

    if (!toggled) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const updatedTask = await TaskModel.getById(taskId);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    if (error && error.code === "PIN_COLUMNS_MISSING") {
      return res.status(409).json({
        success: false,
        error:
          "Pinning is not available until the database is migrated (missing is_pinned/pinned_at).",
      });
    }
    console.error("Error pinning task:", error);
    res.status(500).json({ success: false, error: "Failed to pin task" });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskPosition,
  reorderTasks,
  deleteTask,
  getTaskCounts,
  toggleTaskPin,
  upload,
};
