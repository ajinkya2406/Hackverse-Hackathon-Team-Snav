const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    console.log('User ID:', req.user.id);

    const { title, description, dueDateTime } = req.body;
    
    // Create a new Date object from the provided date and time
    const taskDateTime = new Date(dueDateTime);
    
    const task = new Task({
      title,
      description,
      dueDateTime: taskDateTime,
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

// Update task progress and status
exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { progress, status, notes } = req.body;
    console.log(`Updating task ${taskId} progress to ${progress}% for user ${req.user.id}`);

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    
    if (!task) {
      console.log('Task not found or not owned by user');
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add current state to history before updating
    task.history.push({
      status: task.status,
      progress: task.progress,
      notes: notes || 'Progress update'
    });

    // Update current state
    task.progress = progress;
    if (status) {
      task.status = status;
    }

    await task.save();
    console.log('Task progress updated successfully:', task);
    res.json(task);
  } catch (err) {
    console.error('Update task progress error:', err);
    res.status(500).json({ 
      error: 'Failed to update task progress', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get task history
exports.getTaskHistory = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`Fetching history for task ${taskId} for user ${req.user.id}`);

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    
    if (!task) {
      console.log('Task not found or not owned by user');
      return res.status(404).json({ error: 'Task not found' });
    }

    // Sort history by timestamp in descending order (newest first)
    const history = task.history.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log('Task history fetched successfully');
    res.json(history);
  } catch (err) {
    console.error('Get task history error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch task history', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Search tasks
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      user: req.user.id
    }).sort({ dueDateTime: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search tasks' });
  }
};

// Copy tasks to next day
exports.copyTasksToNextDay = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all tasks for today
    const todayTasks = await Task.find({
      user: req.user.id,
      dueDateTime: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Create new tasks for tomorrow
    const newTasks = todayTasks.map(task => {
      const newDueDateTime = new Date(task.dueDateTime);
      newDueDateTime.setDate(newDueDateTime.getDate() + 1);
      
      return {
        title: task.title,
        description: task.description,
        dueDateTime: newDueDateTime,
        status: 'pending', // Reset status to pending
        progress: 0, // Reset progress to 0
        user: req.user.id
      };
    });

    // Insert new tasks
    await Task.insertMany(newTasks);

    res.json({ message: 'Tasks copied successfully', count: newTasks.length });
  } catch (error) {
    console.error('Error copying tasks:', error);
    res.status(500).json({ error: 'Failed to copy tasks' });
  }
}; 