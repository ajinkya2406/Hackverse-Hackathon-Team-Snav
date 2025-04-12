import React, { useState, useRef } from 'react';
import './MindFreshMusic.css';

const MindFreshMusic = () => {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const mindFreshTracks = [
    {
      id: 1,
      title: 'Mind Fresh 1',
      description: 'Calm your mind with natural sounds and melodies',
      audioFile: '/mindfresh_1.mp3'
    },
    {
      id: 2,
      title: 'Mind Fresh 2',
      description: 'Reduce stress with peaceful ambient soundscapes',
      audioFile: '/mindfresh_2.mp3'
    },
    {
      id: 3,
      title: 'Mind Fresh 3',
      description: 'Soothing melodies for mental clarity and relaxation',
      audioFile: '/mindfresh_3.mp3'
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
      const track = mindFreshTracks.find(t => t.id === trackId);
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
    <div className="mind-fresh-container">
      <h1 className="mind-fresh-title">Mind Fresh Music</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="mind-fresh-cards">
        {mindFreshTracks.map((track) => (
          <div key={track.id} className="fresh-audio-card">
            <div className="fresh-card">
              <div className="card-content">
                <h2>{track.title}</h2>
                <p>{track.description}</p>
                
                {/* Nature animated elements */}
                <div className="nature-elements">
                  <div className="leaf leaf-1"></div>
                  <div className="leaf leaf-2"></div>
                  <div className="leaf leaf-3"></div>
                  <div className="wave wave-1"></div>
                  <div className="wave wave-2"></div>
                  <div className="wave wave-3"></div>
                  <div className="cloud cloud-1"></div>
                  <div className="cloud cloud-2"></div>
                </div>
                
                {/* Audio wave visualizer */}
                <div className="wave-visualizer">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`wave-bar ${currentPlaying === track.id ? 'active' : ''}`} 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
                
                <button
                  className={`fresh-play-button ${currentPlaying === track.id ? 'playing' : ''}`}
                  onClick={() => handlePlayPause(track.id)}
                >
                  {currentPlaying === track.id ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MindFreshMusic; 