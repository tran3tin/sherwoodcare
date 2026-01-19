const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Get all tasks (grouped by status)
router.get("/", taskController.getAllTasks);

// Get task counts by status
router.get("/counts", taskController.getTaskCounts);

// Get single task
router.get("/:taskId", taskController.getTaskById);

// Create new task (with file upload)
router.post(
  "/",
  taskController.upload.array("attachments"),
  taskController.createTask
);

// Update task (with file upload)
router.put(
  "/:taskId",
  taskController.upload.array("attachments"),
  taskController.updateTask
);

// Update task position (drag & drop)
router.patch("/:taskId/position", taskController.updateTaskPosition);

// Toggle task pin
router.patch("/:taskId/pin", taskController.toggleTaskPin);

// Reorder tasks in a column
router.post("/reorder", taskController.reorderTasks);

// Delete task
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
