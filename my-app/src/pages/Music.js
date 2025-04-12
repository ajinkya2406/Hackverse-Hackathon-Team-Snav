import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faBrain, faLeaf } from '@fortawesome/free-solid-svg-icons';
import './Music.css';
import { useNavigate } from 'react-router-dom';

const Music = () => {
  const navigate = useNavigate();
  const musicTypes = [
    {
      title: 'Memorizing Music',
      icon: faBrain,
      description: 'Enhance your memory and focus with specially curated music tracks.',
      link: 'https://www.youtube.com/results?search_query=memory+enhancing+music'
    },
    {
      title: 'Concentration Music',
      icon: faMusic,
      description: 'Boost your concentration and productivity with these focused tracks.',
      link: 'https://www.youtube.com/results?search_query=concentration+music'
    },
    {
      title: 'Mind Fresh Music',
      icon: faLeaf,
      description: 'Refresh your mind and reduce stress with calming melodies.',
      link: 'https://www.youtube.com/results?search_query=relaxing+music'
    }
  ];

  const handleCardClick = (type) => {
    if (type === 'Concentration Music') {
      navigate('/concentration-music');
    } else {
      // Handle other music types
      window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(type), '_blank');
    }
  };

  return (
    <div className="music-container">
      <h1 className="music-title">Music for Your Mind</h1>
      <div className="music-cards">
        {musicTypes.map((music, index) => (
          <div 
            key={index} 
            className="music-card"
            onClick={() => handleCardClick(music.title)}
          >
            <div className="music-icon">
              <FontAwesomeIcon icon={music.icon} />
            </div>
            <h2>{music.title}</h2>
            <p>{music.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Music; 