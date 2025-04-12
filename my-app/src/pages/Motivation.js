import React from 'react';
import './Motivation.css';

function Motivation() {
  return (
    <div className="motivation-container">
      <h1>Motivational Audio</h1>
      <div className="audio-cards">
        <div className="audio-card">
          <h2>Motivation 1</h2>
          <audio controls>
            <source src="/motivation_2.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div className="audio-card">
          <h2>Motivation 2</h2>
          <audio controls>
            <source src="/motivational_2.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div className="audio-card">
          <h2>Motivation 3</h2>
          <audio controls>
            <source src="/motivational_3.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
}

export default Motivation; 