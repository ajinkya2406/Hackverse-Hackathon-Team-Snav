import React, { useState, useRef } from 'react';
import './MemorizingMusic.css';

const MemorizingMusic = () => {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const memorizingTracks = [
    {
      id: 1,
      title: 'Memory Boost 1',
      description: 'Alpha wave music to enhance memory retention',
      audioFile: '/memorizing_1.mp3'
    },
    {
      id: 2,
      title: 'Memory Boost 2',
      description: 'Improve recall and study effectiveness',
      audioFile: '/memorizing_2.mp3'
    },
    {
      id: 3,
      title: 'Memory Boost 3',
      description: 'Enhanced learning and memory consolidation',
      audioFile: '/memorizing_3.mp3'
    }
  ];

  const handlePlayPause = (trackId) => {
    if (currentPlaying === trackId) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentPlaying(null);
      setError(null);
    } else {
      // Stop any currently playing track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create new audio element and play
      const track = memorizingTracks.find(t => t.id === trackId);
      const audio = new Audio();
      
      // Set up error handling
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setError(`Error loading audio file: ${track.title}`);
        setCurrentPlaying(null);
      };
      
      audio.src = track.audioFile;
      audioRef.current = audio;
      
      audio.play()
        .then(() => {
          setCurrentPlaying(trackId);
          setError(null);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          setError(`Error playing audio: ${track.title}`);
          setCurrentPlaying(null);
        });
    }
  };

  return (
    <div className="memorizing-music-container">
      <h1 className="memorizing-music-title">Memorizing Music</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="memorizing-music-cards">
        {memorizingTracks.map((track) => (
          <div key={track.id} className="audio-card">
            <div className="memorizing-card">
              <h2>{track.title}</h2>
              <p>{track.description}</p>
              
              {/* Audio visualizer */}
              <div className="audio-visualizer">
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.3s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.5s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.4s' }}></div>
                <div className={`visualizer-bar ${currentPlaying === track.id ? 'active' : ''}`} style={{ animationDelay: '0.1s' }}></div>
              </div>
              
              {/* Memorizing particle effects */}
              <div className="particles">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="star star-1"></div>
                <div className="star star-2"></div>
                <div className="star star-3"></div>
              </div>
              
              <button
                className={`play-button ${currentPlaying === track.id ? 'playing' : ''}`}
                onClick={() => handlePlayPause(track.id)}
              >
                {currentPlaying === track.id ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemorizingMusic; 