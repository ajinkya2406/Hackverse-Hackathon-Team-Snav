import React from 'react';
import './Motivation.css';

function Motivation() {
  return (
    <div className="motivation-container">
      <h1>Motivational Audio</h1>
      <div className="audio-cards">
        <div className="audio-card">
          <h2>Motivation 1</h2>
          <div className="motivational-card">
            <audio controls>
              <source src="/motivation_2.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="audio-player">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="audio-visualizer">
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.2s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                <div className="visualizer-bar" style={{ height: '80%', animationDelay: '0.4s' }}></div>
                <div className="visualizer-bar" style={{ height: '30%', animationDelay: '0.5s' }}></div>
                <div className="visualizer-bar" style={{ height: '60%', animationDelay: '0.6s' }}></div>
                <div className="visualizer-bar" style={{ height: '90%', animationDelay: '0.7s' }}></div>
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.8s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.9s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '1s' }}></div>
              </div>
              <div className="audio-wave"></div>
            </div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
        <div className="audio-card">
          <h2>Motivation 2</h2>
          <div className="motivational-card">
            <audio controls>
              <source src="/motivational_2.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="audio-player">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              
              <div className="audio-visualizer">
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.2s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                <div className="visualizer-bar" style={{ height: '80%', animationDelay: '0.4s' }}></div>
                <div className="visualizer-bar" style={{ height: '30%', animationDelay: '0.5s' }}></div>
                <div className="visualizer-bar" style={{ height: '60%', animationDelay: '0.6s' }}></div>
                <div className="visualizer-bar" style={{ height: '90%', animationDelay: '0.7s' }}></div>
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.8s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.9s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '1s' }}></div>
              </div>
              
              <div className="audio-wave"></div>
            </div>
            
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
        <div className="audio-card">
          <h2>Motivation 3</h2>
          <div className="motivational-card">
            <audio controls>
              <source src="/motivational_3.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="audio-player">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              
              <div className="audio-visualizer">
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.2s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                <div className="visualizer-bar" style={{ height: '80%', animationDelay: '0.4s' }}></div>
                <div className="visualizer-bar" style={{ height: '30%', animationDelay: '0.5s' }}></div>
                <div className="visualizer-bar" style={{ height: '60%', animationDelay: '0.6s' }}></div>
                <div className="visualizer-bar" style={{ height: '90%', animationDelay: '0.7s' }}></div>
                <div className="visualizer-bar" style={{ height: '40%', animationDelay: '0.8s' }}></div>
                <div className="visualizer-bar" style={{ height: '70%', animationDelay: '0.9s' }}></div>
                <div className="visualizer-bar" style={{ height: '50%', animationDelay: '1s' }}></div>
              </div>
              
              <div className="audio-wave"></div>
            </div>
            
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Motivation; 