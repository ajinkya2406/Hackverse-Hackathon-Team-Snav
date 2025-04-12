import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import './ConcentrationMusic.css';

const ConcentrationMusic = () => {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const musicTracks = [
    {
      id: 1,
      title: 'Focus Music 1',
      description: 'Enhance your concentration with this calming track',
      audioFile: '/focus-music-1.mp3.mp3'
    },
    {
      id: 2,
      title: 'Focus Music 2',
      description: 'Boost your productivity with this ambient sound',
      audioFile: '/focus-music-2.mp3.mp3'
    },
    {
      id: 3,
      title: 'Focus Music 3',
      description: 'Improve your focus with this soothing melody',
      audioFile: '/focus-music-3.mp3.mp3'
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
      const track = musicTracks.find(t => t.id === trackId);
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
    <div className="concentration-music-container">
      <h1 className="concentration-music-title">Concentration Music</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="concentration-music-cards">
        {musicTracks.map((track) => (
          <div key={track.id} className="concentration-music-card">
            <div className="music-player">
              <button
                className={`play-button ${currentPlaying === track.id ? 'playing' : ''}`}
                onClick={() => handlePlayPause(track.id)}
              >
                <FontAwesomeIcon icon={currentPlaying === track.id ? faPause : faPlay} />
              </button>
            </div>
            <h2>{track.title}</h2>
            <p>{track.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConcentrationMusic; 