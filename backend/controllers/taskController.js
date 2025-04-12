const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    console.log('User ID:', req.user.id);

    const { title, description, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      user: req.user.id
    });

    console.log('Task object created:', task);
    await task.save();
    console.log('Task saved successfully');
    
    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ 
      error: 'Failed to create task', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user.id);
    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
    console.log('Found tasks:', tasks);
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch tasks', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    console.log(`Updating task ${taskId} status to ${status} for user ${req.user.id}`);

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      console.log('Task not found or not owned by user');
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Task updated successfully:', task);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ 
      error: 'Failed to update task', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`Deleting task ${taskId} for user ${req.user.id}`);

    const task = await Task.findOneAndDelete({ _id: taskId, user: req.user.id });
    
    if (!task) {
      console.log('Task not found or not owned by user');
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Task deleted successfully');
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ 
      error: 'Failed to delete task', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}; 