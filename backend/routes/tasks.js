const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const taskController = require('../controllers/taskController');

// All routes are protected and require authentication
router.use(auth);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ dueDateTime: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    // Validate dueDateTime
    if (!req.body.dueDateTime) {
      return res.status(400).json({ error: 'Due date and time is required' });
    }

    const dueDateTime = new Date(req.body.dueDateTime);
    if (isNaN(dueDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid due date and time format' });
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      dueDateTime: dueDateTime,
      status: req.body.status || 'pending',
      user: req.user._id
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!req.body.status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update only the status field
    task.status = req.body.status;
    const updatedTask = await task.save();
    
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Update task
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate dueDateTime if provided
    if (req.body.dueDateTime) {
      const dueDateTime = new Date(req.body.dueDateTime);
      if (isNaN(dueDateTime.getTime())) {
        return res.status(400).json({ error: 'Invalid due date and time format' });
      }
      task.dueDateTime = dueDateTime;
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'status'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task progress
router.patch('/:id/progress', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    if (typeof req.body.progress !== 'number' || req.body.progress < 0 || req.body.progress > 100) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add current state to history before updating
    task.history.push({
      status: task.status,
      progress: task.progress,
      notes: req.body.notes || 'Progress update'
    });

    // Update progress
    task.progress = req.body.progress;
    
    // Update status if provided
    if (req.body.status) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      task.status = req.body.status;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task progress:', err);
    res.status(500).json({ error: 'Failed to update task progress' });
  }
});

// Get task history
router.get('/:id/history', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Sort history by timestamp in descending order (newest first)
    const history = task.history.sort((a, b) => b.timestamp - a.timestamp);
    res.json(history);
  } catch (err) {
    console.error('Error fetching task history:', err);
    res.status(500).json({ error: 'Failed to fetch task history' });
  }
});

module.exports = router; 