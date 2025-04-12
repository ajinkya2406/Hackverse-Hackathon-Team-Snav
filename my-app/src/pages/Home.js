import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Axios instance with proper auth configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function Home() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    dueTime: format(new Date(), 'HH:mm')
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBreakSuggestions, setShowBreakSuggestions] = useState(false);
  const [suggestedBreaks, setSuggestedBreaks] = useState([]);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/verify');
        setUserData(response.data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      // Set the auth header for the initial request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchTasks();
    }
  }, [navigate, fetchTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return setError('Task title is required');

    try {
      setLoading(true);
      // Combine date and time with seconds set to 00
      const [hours, minutes] = newTask.dueTime.split(':');
      const dueDateTime = new Date(`${newTask.dueDate}T${hours}:${minutes}:00.000`);
      
      // Ensure the date is valid
      if (isNaN(dueDateTime.getTime())) {
        throw new Error('Invalid date or time format');
      }

      const taskWithDateTime = {
        ...newTask,
        dueDateTime: dueDateTime.toISOString()
      };
      
      await api.post('/tasks', taskWithDateTime);
      setNewTask({
        title: '',
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        dueTime: format(new Date(), 'HH:mm')
      });
      fetchTasks();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (dueDate, status) => {
    if (status === 'completed') {
      return { text: 'Completed', class: 'completed' };
    }

    const now = new Date();
    const due = new Date(dueDate);
    
    // Convert to Indian timezone (IST)
    const indianNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const indianDue = new Date(due.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const diffInMinutes = Math.floor((indianDue - indianNow) / (1000 * 60));
    const hoursRemaining = Math.floor(diffInMinutes / 60);
    const minutesRemaining = diffInMinutes % 60;
    
    if (diffInMinutes < 0) return { text: 'Overdue', class: 'urgent' };
    if (hoursRemaining < 1) return { text: `${minutesRemaining} minutes remaining`, class: 'urgent' };
    if (hoursRemaining < 24) return { text: `${hoursRemaining} hours ${minutesRemaining} minutes remaining`, class: 'urgent' };
    if (hoursRemaining < 48) return { text: `${Math.floor(hoursRemaining/24)} days remaining`, class: 'warning' };
    return { text: `${Math.floor(hoursRemaining/24)} days remaining`, class: 'safe' };
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) {
        setError('Task not found');
        return;
      }

      // Validate the new status
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        setError('Invalid status value');
        return;
      }

      if (newStatus === 'in-progress') {
        // Get the current due date and time
        const currentDueDate = new Date(task.dueDateTime || task.dueDate);
        if (isNaN(currentDueDate.getTime())) {
          setError('Invalid due date');
          return;
        }
        
        // Add 1 hour while preserving the exact time format
        const newDueDate = new Date(currentDueDate.getTime() + 60 * 60 * 1000);
        const formattedDate = newDueDate.toISOString().split('.')[0] + '.000Z'; // Ensure consistent format with seconds
        
        const response = await api.patch(`/tasks/${taskId}`, { 
          status: newStatus,
          dueDateTime: formattedDate
        });
        
        if (response.data) {
          fetchTasks();
        }
      } else {
        const response = await api.patch(`/tasks/${taskId}/status`, { 
          status: newStatus 
        });
        if (response.data) {
          fetchTasks();
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to update task status. Please try again.');
      }
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) {
        setError('Task not found');
        return;
      }

      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getAgeAppropriateBreaks = (age) => {
    if (age <= 12) {
      // School children (6-12)
      return [
        { text: "Do 5 jumping jacks", icon: "🦘" },
        { text: "Draw something fun", icon: "🎨" },
        { text: "Drink some water", icon: "💧" },
        { text: "Look out the window and count birds", icon: "🐦" },
        { text: "Do a quick stretch", icon: "🤸‍♂️" },
        { text: "Play with your favorite toy for 5 minutes", icon: "🎮" },
        { text: "Practice writing your name creatively", icon: "✏️" },
        { text: "Do a simple puzzle", icon: "🧩" },
        { text: "Read a short story", icon: "📚" },
        { text: "Dance to your favorite song", icon: "💃" },
        // 15 new suggestions for school children
        { text: "Practice skip counting by 2s", icon: "🔢" },
        { text: "Make a paper airplane", icon: "✈️" },
        { text: "Do the alphabet exercise (move with each letter)", icon: "🔤" },
        { text: "Color a small picture", icon: "🖍️" },
        { text: "Practice tying your shoelaces", icon: "👟" },
        { text: "Count backwards from 20", icon: "⏰" },
        { text: "Do a mini scavenger hunt in your room", icon: "🔍" },
        { text: "Practice your spelling words", icon: "📝" },
        { text: "Make funny faces in the mirror", icon: "🤪" },
        { text: "Build something with blocks", icon: "🧱" },
        { text: "Practice your times tables", icon: "✖️" },
        { text: "Do some animal walks (crab, bear, etc.)", icon: "🦀" },
        { text: "Draw your favorite animal", icon: "🐘" },
        { text: "Practice saying 'thank you' in different languages", icon: "🌍" },
        { text: "Make shadow puppets with your hands", icon: "🤲" }
      ];
    } else if (age <= 18) {
      // Teenagers (13-18)
      return [
        { text: "Take a quick walk", icon: "🚶‍♂️" },
        { text: "Listen to your favorite song", icon: "🎵" },
        { text: "Do some quick stretches", icon: "🧘‍♂️" },
        { text: "Practice deep breathing", icon: "🌬️" },
        { text: "Organize your study space", icon: "📚" },
        { text: "Have a healthy snack", icon: "🍎" },
        { text: "Do a quick workout routine", icon: "💪" },
        { text: "Write in your journal", icon: "📝" },
        { text: "Chat with a friend", icon: "💬" },
        { text: "Play a quick mobile game", icon: "📱" },
        // 15 new suggestions for teenagers
        { text: "Review your study goals", icon: "🎯" },
        { text: "Practice a musical instrument", icon: "🎸" },
        { text: "Do a quick vocabulary review", icon: "📖" },
        { text: "Try a new study technique", icon: "🧠" },
        { text: "Create a mind map", icon: "🗺️" },
        { text: "Do some quick cardio exercises", icon: "🏃" },
        { text: "Practice a foreign language", icon: "🗣️" },
        { text: "Solve a quick math puzzle", icon: "🔢" },
        { text: "Draw a sketch of what you're learning", icon: "✏️" },
        { text: "Take photos of something interesting", icon: "📸" },
        { text: "Write a short creative story", icon: "📝" },
        { text: "Do a quick meditation session", icon: "🧘‍♀️" },
        { text: "Plan your next study session", icon: "📅" },
        { text: "Practice positive affirmations", icon: "✨" },
        { text: "Organize your digital files", icon: "💻" }
      ];
    } else if (age <= 25) {
      // College students (19-25)
      return [
        { text: "Do some desk stretches", icon: "🧘‍♂️" },
        { text: "Take a power walk", icon: "🚶‍♂️" },
        { text: "Meditate for 5 minutes", icon: "🧘" },
        { text: "Have a coffee break", icon: "☕" },
        { text: "Do quick eye exercises", icon: "👀" },
        { text: "Listen to a podcast snippet", icon: "🎧" },
        { text: "Review your goals", icon: "📋" },
        { text: "Do some push-ups", icon: "💪" },
        { text: "Call a friend", icon: "📱" },
        { text: "Practice mindfulness", icon: "🧠" },
        // 15 new suggestions for college students
        { text: "Review your class notes", icon: "📓" },
        { text: "Plan your assignments timeline", icon: "📅" },
        { text: "Do a quick LinkedIn update", icon: "💼" },
        { text: "Research internship opportunities", icon: "🔍" },
        { text: "Practice interview questions", icon: "💭" },
        { text: "Update your resume", icon: "📄" },
        { text: "Network with classmates", icon: "🤝" },
        { text: "Read industry news", icon: "📰" },
        { text: "Work on a side project", icon: "💡" },
        { text: "Join an online study group", icon: "👥" },
        { text: "Create a study schedule", icon: "⏰" },
        { text: "Practice presentation skills", icon: "🎤" },
        { text: "Do a quick coding exercise", icon: "💻" },
        { text: "Write a blog post", icon: "✍️" },
        { text: "Learn a new skill online", icon: "🎓" }
      ];
    } else {
      // Working professionals (26+)
      return [
        { text: "Do desk ergonomic exercises", icon: "🪑" },
        { text: "Take a mindful break", icon: "🧘‍♂️" },
        { text: "Stretch your neck and shoulders", icon: "💆‍♂️" },
        { text: "Have a healthy snack", icon: "🥗" },
        { text: "Do eye relaxation exercises", icon: "👁️" },
        { text: "Take a short walk", icon: "🚶‍♂️" },
        { text: "Practice deep breathing", icon: "🫁" },
        { text: "Organize your workspace", icon: "🗄️" },
        { text: "Hydrate with water", icon: "💧" },
        { text: "Do wrist and hand stretches", icon: "🤚" },
        // 15 new suggestions for working professionals
        { text: "Check your posture alignment", icon: "⬆️" },
        { text: "Do a quick email cleanup", icon: "📧" },
        { text: "Plan your next meeting agenda", icon: "📊" },
        { text: "Update your to-do list", icon: "✅" },
        { text: "Network with colleagues", icon: "👥" },
        { text: "Read an industry article", icon: "📱" },
        { text: "Practice stress management", icon: "🧘‍♀️" },
        { text: "Do a quick productivity review", icon: "📈" },
        { text: "Take a coffee networking break", icon: "☕" },
        { text: "Learn a new work skill", icon: "💡" },
        { text: "Do a quick meditation session", icon: "🧠" },
        { text: "Review your career goals", icon: "🎯" },
        { text: "Organize digital files", icon: "📁" },
        { text: "Practice active listening", icon: "👂" },
        { text: "Do a quick workspace declutter", icon: "🧹" }
      ];
    }
  };

  const generateBreakSuggestions = () => {
    if (!userData) return;
    
    const ageAppropriateBreaks = getAgeAppropriateBreaks(userData.age);
    const shuffled = [...ageAppropriateBreaks].sort(() => 0.5 - Math.random());
    setSuggestedBreaks(shuffled.slice(0, 3));
    setShowBreakSuggestions(true);
  };

  return (
    <div className="task-manager-container">
      <div className="max-w-3xl mx-auto w-full">
        <div className="task-manager-header">
          <h1 className="task-manager-title">Task Manager</h1>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="task-form-container">
            <h2 className="task-form-title">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={newTask.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate" className="form-label">Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueTime" className="form-label">Due Time</label>
                <input
                  id="dueTime"
                  name="dueTime"
                  type="time"
                  value={newTask.dueTime}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Adding Task...' : 'Add Task'}
              </button>
            </form>
            {!loading && (
              <button
                onClick={generateBreakSuggestions}
                className="generate-breaks-button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Break Suggestions
              </button>
            )}
            {showBreakSuggestions && (
              <div className="break-suggestions">
                <h3 className="break-suggestions-title">Suggested Breaks</h3>
                {suggestedBreaks.map((suggestion, index) => (
                  <div key={index} className="break-suggestion">
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="task-list-container">
            <h2 className="task-list-title">Your Tasks</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="loading-state">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="empty-state">No tasks yet. Add your first task!</div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task._id} 
                    className="task-card"
                    data-status={task.status}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description}</p>
                        <p className="task-due-date">
                          Due: {format(new Date(task.dueDateTime || task.dueDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <span className={`task-time-remaining ${calculateTimeRemaining(task.dueDateTime || task.dueDate, task.status).class}`}>
                          {calculateTimeRemaining(task.dueDateTime || task.dueDate, task.status).text}
                        </span>
                      </div>
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="delete-task-button"
                          title="Delete Task"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
