const TaskModel = require("../models/TaskModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      __dirname,
      "../public/uploads/task-attachments"
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

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assigned_to } =
      req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    // Handle file upload
    let attachment_url = null;
    let attachment_name = null;
    if (req.file) {
      attachment_url = `/uploads/task-attachments/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const taskData = {
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      due_date: due_date || null,
      assigned_to: assigned_to || null,
      attachment_url,
      attachment_name,
    };

    const newTask = await TaskModel.create(taskData);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    // Return actual error in dev/debug mode or specifically for this issue
    res.status(500).json({
      success: false,
      error: "Failed to create task",
      details: error.message,
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
      remove_attachment,
    } = req.body;

    const existingTask = await TaskModel.getById(taskId);
    if (!existingTask) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Handle file upload
    let attachment_url = existingTask.attachment_url;
    let attachment_name = existingTask.attachment_name;

    // Remove old attachment if requested or if new file is uploaded
    if (remove_attachment === "true" || req.file) {
      if (existingTask.attachment_url) {
        const oldFilePath = path.join(
          __dirname,
          "../public",
          existingTask.attachment_url
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      attachment_url = null;
      attachment_name = null;
    }

    // Set new attachment if file uploaded
    if (req.file) {
      attachment_url = `/uploads/task-attachments/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const taskData = {
      title: title || existingTask.title,
      description:
        description !== undefined ? description : existingTask.description,
      status: status || existingTask.status,
      priority: priority || existingTask.priority,
      due_date: due_date !== undefined ? due_date : existingTask.due_date,
      assigned_to:
        assigned_to !== undefined ? assigned_to : existingTask.assigned_to,
      position: position !== undefined ? position : existingTask.position,
      attachment_url,
      attachment_name,
    };

    const updated = await TaskModel.update(taskId, taskData);

    if (!updated) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to update task" });
    }

    const updatedTask = await TaskModel.getById(taskId);
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, error: "Failed to update task" });
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
