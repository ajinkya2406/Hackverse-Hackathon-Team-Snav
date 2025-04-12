import React, { useState, useEffect } from 'react';
import './Game.css';

const Game = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const motivationalAudios = [
    '/motivational_2.mp3',
    '/motivational_3.mp3',
    '/motivation_2.mp3'
  ];

  const playRandomAudio = () => {
    try {
      if (isPlaying && currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      // Clean up previous audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Create and play new audio
      const randomAudio = motivationalAudios[Math.floor(Math.random() * motivationalAudios.length)];
      const audio = new Audio(randomAudio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      audio.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      audio.play()
        .then(() => {
          setIsPlaying(true);
          setCurrentAudio(audio);
        })
        .catch(error => {
          console.error("Audio playback error:", error);
          setIsPlaying(false);
          setCurrentAudio(null);
        });
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  const games = [
    {
      id: 1,
      title: "Memory Match",
      description: "Test your memory by matching pairs of cards. Find all matching pairs to win!",
      icon: "🎴"
    },
    {
      id: 2,
      title: "Word Scramble",
      description: "Unscramble the letters to form a valid word. You have 3 tries for each word!",
      icon: "🔤"
    },
    {
      id: 3,
      title: "Quick Math",
      description: "Solve simple math problems as quickly as possible. Each correct answer gives you 10 points!",
      icon: "➕"
    }
  ];

  const initializeMemoryMatch = () => {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const cards = [...emojis, ...emojis];
    return {
      cards: cards.sort(() => Math.random() - 0.5),
      flipped: Array(cards.length).fill(false),
      matched: Array(cards.length).fill(false),
      firstCard: null,
      secondCard: null,
      moves: 0
    };
  };

  const initializeWordScramble = () => {
    const words = ['REACT', 'JAVASCRIPT', 'PYTHON', 'JAVA', 'HTML', 'CSS'];
    const currentWord = words[Math.floor(Math.random() * words.length)];
    const scrambled = currentWord.split('').sort(() => Math.random() - 0.5).join('');
    return {
      currentWord,
      scrambled,
      attempts: 3,
      solved: false
    };
  };

  const initializeQuickMath = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    switch(operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
    }
    
    return {
      question: `${num1} ${operation} ${num2}`,
      answer,
      timeLeft: 10
    };
  };

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    switch(gameId) {
      case 1:
        setGameState(initializeMemoryMatch());
        break;
      case 2:
        setGameState(initializeWordScramble());
        break;
      case 3:
        setGameState(initializeQuickMath());
        break;
    }
  };

  const handleMemoryCardClick = (index) => {
    if (gameState.flipped[index] || gameState.matched[index]) return;
    
    const newFlipped = [...gameState.flipped];
    newFlipped[index] = true;
    
    if (gameState.firstCard === null) {
      setGameState({...gameState, firstCard: index, flipped: newFlipped});
    } else {
      const secondCard = index;
      setGameState({...gameState, secondCard, flipped: newFlipped, moves: gameState.moves + 1});
      
      if (gameState.cards[gameState.firstCard] === gameState.cards[secondCard]) {
        const newMatched = [...gameState.matched];
        newMatched[gameState.firstCard] = true;
        newMatched[secondCard] = true;
        setTimeout(() => {
          setGameState({...gameState, matched: newMatched, firstCard: null, secondCard: null});
          if (newMatched.every(m => m)) {
            setScore(score + 100);
            setFeedback('Congratulations! You won Memory Match!');
          }
        }, 1000);
      } else {
        setTimeout(() => {
          const newFlipped = [...gameState.flipped];
          newFlipped[gameState.firstCard] = false;
          newFlipped[secondCard] = false;
          setGameState({...gameState, flipped: newFlipped, firstCard: null, secondCard: null});
        }, 1000);
      }
    }
  };

  const handleWordGuess = (guess) => {
    if (guess.toUpperCase() === gameState.currentWord) {
      setScore(score + 50);
      setFeedback('Correct! You solved the word scramble!');
      setTimeout(() => {
        setGameState(initializeWordScramble());
      }, 1500);
    } else {
      const newAttempts = gameState.attempts - 1;
      if (newAttempts === 0) {
        setFeedback(`Game Over! The word was ${gameState.currentWord}`);
        setTimeout(() => {
          setGameState(initializeWordScramble());
        }, 1500);
      } else {
        setGameState({...gameState, attempts: newAttempts});
        setFeedback(`Wrong! You have ${newAttempts} attempts left.`);
      }
    }
  };

  const handleMathAnswer = (answer) => {
    if (parseInt(answer) === gameState.answer) {
      setScore(score + 10);
      setFeedback('Correct! +10 points!');
      setTimeout(() => {
        setGameState(initializeQuickMath());
      }, 1000);
    } else {
      setFeedback('Wrong answer! Try again.');
    }
  };

  useEffect(() => {
    if (selectedGame === 3) {
      const timer = setInterval(() => {
        if (gameState.timeLeft > 0) {
          setGameState({...gameState, timeLeft: gameState.timeLeft - 1});
        } else {
          setFeedback('Time\'s up! Try again.');
          setGameState(initializeQuickMath());
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.timeLeft, selectedGame]);

  return (
    <div className="game-container">
      <h1 className="game-title">Mind Refresh Games</h1>
      <div className="score-display">Score: {score}</div>
      
      {!selectedGame ? (
        <div className="games-grid">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="game-card"
              onClick={() => handleGameSelect(game.id)}
            >
              <div className="game-icon">{game.icon}</div>
              <h3 className="game-title">{game.title}</h3>
              <p className="game-description">{game.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="game-content">
          <div className="game-header">
            <button className="back-btn" onClick={() => setSelectedGame(null)}>Back to Games</button>
            <div className="audio-container">
              <span className="audio-tooltip">Click me for motivation while playing game!</span>
              <button className="audio-btn" onClick={playRandomAudio}>
                <img 
                  src="/audio.png" 
                  alt="Play Audio" 
                  className={isPlaying ? 'playing' : ''}
                />
              </button>
            </div>
          </div>
          
          {selectedGame === 1 && (
            <div className="memory-game">
              <h2>Memory Match</h2>
              <div className="memory-grid">
                {gameState.cards.map((card, index) => (
                  <div
                    key={index}
                    className={`memory-card ${gameState.flipped[index] ? 'flipped' : ''} ${gameState.matched[index] ? 'matched' : ''}`}
                    onClick={() => handleMemoryCardClick(index)}
                  >
                    {gameState.flipped[index] ? card : '❓'}
                  </div>
                ))}
              </div>
              <p>Moves: {gameState.moves}</p>
            </div>
          )}

          {selectedGame === 2 && (
            <div className="word-scramble">
              <h2>Word Scramble</h2>
              <div className="scrambled-word">{gameState.scrambled}</div>
              <input
                type="text"
                placeholder="Enter your guess"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleWordGuess(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <p>Attempts left: {gameState.attempts}</p>
            </div>
          )}

          {selectedGame === 3 && (
            <div className="quick-math">
              <h2>Quick Math</h2>
              <div className="math-question">{gameState.question}</div>
              <input
                type="number"
                placeholder="Enter your answer"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleMathAnswer(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <p>Time left: {gameState.timeLeft} seconds</p>
            </div>
          )}

          {feedback && <p className={`feedback ${feedback.includes('Correct') ? 'success' : 'error'}`}>{feedback}</p>}
        </div>
      )}
    </div>
  );
};

export default Game; 