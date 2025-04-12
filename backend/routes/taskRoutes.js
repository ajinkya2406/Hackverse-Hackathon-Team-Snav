const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask,
  searchTasks
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, getTasks);

// Create a new task
router.post('/', auth, createTask);

// Update task status
router.patch('/:taskId/status', auth, updateTaskStatus);

// Delete a task
router.delete('/:taskId', auth, deleteTask);

// Search tasks
router.get('/search', auth, searchTasks);

module.exports = router; 