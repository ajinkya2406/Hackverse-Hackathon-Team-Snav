import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PieChart } from 'react-minimal-pie-chart';
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    const diffInMinutes = Math.floor((due - now) / (1000 * 60));
    const hoursRemaining = Math.floor(diffInMinutes / 60);
    const minutesRemaining = diffInMinutes % 60;

    if (diffInMinutes < 0) return { text: 'Overdue', class: 'urgent' };
    if (hoursRemaining < 1) return { text: `${minutesRemaining} minutes remaining`, class: 'urgent' };
    if (hoursRemaining < 24) return { text: `${hoursRemaining} hours ${minutesRemaining} minutes remaining`, class: 'warning' };
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
        
        // Add 20 minutes while preserving the exact time format
        const newDueDate = new Date(currentDueDate.getTime() + 20 * 60 * 1000);
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

  const handleProgressUpdate = async (taskId, progress, notes = '') => {
    try {
      await api.patch(`/tasks/${taskId}/progress`, {
        progress,
        notes
      });
      fetchTasks(); // Refresh tasks list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update progress');
    }
  };

  const calculateTotalProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / tasks.length);
  };

  const getProgressData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDateTime);
      return taskDate >= today && taskDate < tomorrow;
    });

    const statusCounts = dailyTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const totalTasks = dailyTasks.length;
    if (totalTasks === 0) {
      return [
        { title: 'No Tasks Today', value: 100, color: '#E0E0E0' }
      ];
    }

    return [
      {
        title: 'Completed',
        value: (statusCounts['completed'] || 0) / totalTasks * 100,
        color: '#4CAF50' // Green for completed
      },
      {
        title: 'In Progress',
        value: (statusCounts['in-progress'] || 0) / totalTasks * 100,
        color: '#2196F3' // Blue for in progress
      },
      {
        title: 'Pending',
        value: (statusCounts['pending'] || 0) / totalTasks * 100,
        color: '#F44336' // Red for pending
      }
    ];
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDateTime);
      return isSameDay(taskDate, new Date(date));
    });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to search tasks');
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleMusicClick = () => {
    navigate('/music');
  };

  const handleMotivation = () => {
    navigate('/motivation');
  };

  const handleGame = () => {
    // Implement game functionality
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  };

  const copyTasksToNextDay = async () => {
    try {
      const response = await api.post('/tasks/copy-to-next-day');
      if (response.data) {
        fetchTasks(); // Refresh tasks list
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to copy tasks');
    }
  };

  const handleTaskMusic = (e) => {
    e.stopPropagation();
    const musicFiles = [
      '/focus-music-1.mp3.mp3',
      '/focus-music-2.mp3.mp3',
      '/focus-music-3.mp3.mp3'
    ];
    const randomMusic = musicFiles[Math.floor(Math.random() * musicFiles.length)];
    const audio = new Audio(randomMusic);
    audio.play();
    
    // Stop the music after 30 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 30000);
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="profile-container">
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              {userData?.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="profile-image"
                />
              ) : (
                <div className="profile-icon">
                  {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="profile-name">{userData?.username}</span>
            </button>
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <h3>Profile Details</h3>
                  <p><strong>Username:</strong> {userData?.username}</p>
                  <p><strong>Email:</strong> {userData?.email}</p>
                  <p><strong>Age:</strong> {userData?.age}</p>
                  <p><strong>Education:</strong> {userData?.educationStatus}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(task => (
                  <div 
                    key={task._id} 
                    className="search-result-item"
                    onClick={() => {
                      setSelectedDate(format(new Date(task.dueDateTime), 'yyyy-MM-dd'));
                      setShowSearchResults(false);
                    }}
                  >
                    <h4>{task.title}</h4>
                    <p>{format(new Date(task.dueDateTime), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nav-right">
          <button className="nav-btn" onClick={handleMusicClick}>
            <span className="nav-icon">🎵</span>
            <span className="nav-text">Music</span>
          </button>
          <button className="nav-btn" onClick={handleMotivation}>
            <span className="nav-icon">💪</span>
            <span className="nav-text">Motivation</span>
          </button>
          <button className="nav-btn" onClick={handleGame}>
            <span className="nav-icon">🎮</span>
            <span className="nav-text">Game</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full">
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
                <label htmlFor="dueTime" className="form-label">Due Time (24-hour format)</label>
                <input
                  type="time"
                  name="dueTime"
                  value={newTask.dueTime}
                  onChange={handleInputChange}
                  className="form-input"
                  step="300"
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
            <div className="action-buttons">
              <button
                onClick={generateBreakSuggestions}
                className="generate-breaks-button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Break Suggestions
              </button>
              <button
                onClick={copyTasksToNextDay}
                className="copy-tasks-button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Copy Today's Tasks to Tomorrow
              </button>
            </div>
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

          <div className="progress-section">
            <h2>Task Status Distribution</h2>
            <div className="pie-chart-container">
              <PieChart
                data={getProgressData()}
                lineWidth={20}
                paddingAngle={5}
                rounded
                label={({ dataEntry }) => dataEntry.value > 0 ? `${Math.round(dataEntry.value)}%` : ''}
                labelStyle={{
                  fontSize: '12px',
                  fontFamily: 'sans-serif',
                  fill: '#333'
                }}
                labelPosition={0}
                style={{ height: '200px', width: '200px' }}
              />
              <div className="progress-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
                  <span>In Progress</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
                  <span>Pending</span>
                </div>
              </div>
            </div>
            <div className="total-progress">
              <h3>Overall Progress</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateTotalProgress()}%` }}
                ></div>
              </div>
              <span className="progress-text">{calculateTotalProgress()}%</span>
            </div>
          </div>

          <div className="tasks-container">
            <div className="tasks-header">
              <h2 className="task-list-title">Your Tasks</h2>
              <div className="date-filter">
                <button 
                  className="filter-btn"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                >
                  {showDateFilter ? 'Hide Date Filter' : 'Show Date Filter'}
                </button>
                {showDateFilter && (
                  <div className="date-picker">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="date-input"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="loading-state">Loading tasks...</div>
              ) : getTasksByDate(selectedDate).length === 0 ? (
                <div className="empty-state">No tasks for this date. Add a new task!</div>
              ) : (
                getTasksByDate(selectedDate).map(task => (
                  <div 
                    key={task._id} 
                    className={`task-card ${task.status} ${selectedTask?._id === task._id ? 'selected' : ''}`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        <button 
                          className="music-btn"
                          onClick={handleTaskMusic}
                        >
                          <img src="/audio.png" alt="Play Music" className="music-icon" />
                        </button>
                        <div className="action-separator">
                          <i className="fas fa-circle"></i>
                        </div>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-footer">
                      <div className="task-info">
                        <span className="due-date">
                          Due: {format(new Date(task.dueDateTime), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <span className={`time-remaining ${calculateTimeRemaining(task.dueDateTime, task.status).class}`}>
                          {calculateTimeRemaining(task.dueDateTime, task.status).text}
                        </span>
                      </div>
                      <div className="task-progress">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress || 0}
                          onChange={(e) => handleProgressUpdate(task._id, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="progress-slider"
                        />
                        <span className="progress-value">{task.progress || 0}%</span>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task._id, e.target.value);
                        }}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Task History</h3>
              <button 
                className="close-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                ×
              </button>
            </div>
            <div className="history-list">
              {taskHistory.map((entry, index) => (
                <div key={index} className="history-entry">
                  <div className="history-timestamp">
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="history-details">
                    <span className="history-status" data-status={entry.status}>
                      {entry.status}
                    </span>
                    <span className="history-progress">{entry.progress}%</span>
                    {entry.notes && (
                      <p className="history-notes">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
