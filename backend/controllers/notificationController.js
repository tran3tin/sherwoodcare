const EmployeeNoteModel = require("../models/EmployeeNoteModel");
const CustomerNoteModel = require("../models/CustomerNoteModel");

// Get all due notes (employee + customer notes)
const getDueNotes = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all employee notes with due dates
    const employeeNotes = await EmployeeNoteModel.getDueNotes(today);

    // Get all customer notes with due dates
    const customerNotes = await CustomerNoteModel.getDueNotes(today);

    // Combine and format notifications
    const notifications = [
      ...employeeNotes.map((note) => ({
        id: `employee-${note.note_id}`,
        type: "employee",
        noteId: note.note_id,
        employeeId: note.employee_id,
        employeeName: `${note.first_name || ""} ${note.last_name || ""}`.trim(),
        title: note.title,
        content: note.content,
        priority: note.priority,
        dueDate: note.due_date,
        isOverdue: new Date(note.due_date) < today,
        isDueToday:
          new Date(note.due_date).toDateString() === today.toDateString(),
        createdAt: note.created_at,
      })),
      ...customerNotes.map((note) => ({
        id: `customer-${note.note_id}`,
        type: "customer",
        noteId: note.note_id,
        customerId: note.customer_id,
        customerName: note.full_name || "",
        title: note.title,
        content: note.content,
        priority: note.priority,
        dueDate: note.due_date,
        isOverdue: new Date(note.due_date) < today,
        isDueToday:
          new Date(note.due_date).toDateString() === today.toDateString(),
        createdAt: note.created_at,
      })),
    ];

    // Sort by priority (high first) and due date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching due notes:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch notifications" });
  }
};

module.exports = {
  getDueNotes,
};
