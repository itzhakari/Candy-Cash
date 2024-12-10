import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import './index.css';
import backgroundImage from './assets/background.jpg';
import characterImage from './assets/character.jpg';
import pathImage from './assets/path.png';
import obstacleImage1 from './assets/assetsone.png';
import obstacleImage2 from './assets/assetstwo.png';
import obstacleImage4 from './assets/assetsseven.png';
import obstacleImage5 from './assets/assetseight.png';

const apiKey = "AIzaSyAzH42-ROR5hja6hoDMYqqdrtkUi4DQLQY";

function Game() {
  const [isJumping, setIsJumping] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0); // To track cumulative score
  const [obstacles, setObstacles] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showWithdrawScreen, setShowWithdrawScreen] = useState(false); // To control showing the withdraw screen
  const [message, setMessage] = useState(""); // To store the text input
  const [showLoginOverlay, setShowLoginOverlay] = useState(false); // To control showing login overlay

  const obstacleImages = [
    { img: obstacleImage1, className: 'obstacle1' },
    { img: obstacleImage2, className: 'obstacle2' },
    { img: obstacleImage4, className: 'obstacle4' },
    { img: obstacleImage5, className: 'obstacle5' }
  ];

  const handleJump = () => {
    if (isGameStarted && !isGameOver && !isPaused) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500); // Duration of the jump animation
    }
  };

  const handleStart = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setObstacles([]);
    setElapsedTime(0); // Reset time when the game starts
  };

  const handleRetry = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setObstacles([]);
    setElapsedTime(0); // Reset time on retry
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleQuit = () => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setObstacles([]);
  };

  const handleWithdraw = () => {
    setShowWithdrawScreen(true); // Show the withdraw screen when clicked
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value); // Update the message state as the user types
  };

  const handleLogin = () => {
  console.log("Attempting Google login...");
  
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("User logged in:", user);
      // You can now store user info or update UI accordingly
    })
    .catch((error) => {
      console.error("Error during login:", error.message);
    });
};


  // Spawn obstacles in order at fixed intervals
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;

    // Spawn first obstacle immediately
    spawnObstacle();

    const spawnInterval = setInterval(() => {
      spawnObstacle();
    }, 8000); // Spawn an obstacle every 3 seconds

    return () => clearInterval(spawnInterval);
  }, [isGameStarted, isGameOver, isPaused, elapsedTime]);

  const spawnObstacle = () => {
    const randomObstacle = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
    const randomDuration = Math.max(4 - elapsedTime / 60, 0.5); // Reduce duration as time passes (minimum of 0.5s)
    
    setObstacles(prevObstacles => [
      ...prevObstacles,
      {
        id: Date.now(),
        image: randomObstacle.img,
        className: randomObstacle.className,
        left: '100%',
        animationDuration: `${randomDuration}s`, // Fixed syntax error here
        cycle: 0
      }
    ]);
  };

  // Loop obstacles back to the starting position once they go off-screen
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setObstacles(prevObstacles =>
        prevObstacles.map(obstacle => {
          const obstacleElement = document.getElementById(obstacle.id);
          if (obstacleElement && obstacleElement.getBoundingClientRect().right < 0) {
            return { ...obstacle, left: '100%', cycle: obstacle.cycle + 1 };
          }
          return obstacle;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [obstacles, isGameOver]);

  // Collision detection logic
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;

    const interval = setInterval(() => {
      const character = document.querySelector('.chpic');
      obstacles.forEach(obstacle => {
        const obstacleElement = document.getElementById(obstacle.id);
        if (character && obstacleElement) {
          const characterRect = character.getBoundingClientRect();
          const obstacleRect = obstacleElement.getBoundingClientRect();

          if (
            characterRect.left < obstacleRect.right &&
            characterRect.right > obstacleRect.left &&
            characterRect.top < obstacleRect.bottom &&
            characterRect.bottom > obstacleRect.top
          ) {
            setIsGameOver(true);
            setIsGameStarted(false);
          }
        }
      });
    }, 50); // Check collision every 50ms for improved accuracy

    return () => clearInterval(interval);
  }, [isGameStarted, isGameOver, isPaused, obstacles]);

  // Score increment logic
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;

    const scoreInterval = setInterval(() => {
      setScore(prevScore => prevScore + 1.67);
    }, 300);

    return () => clearInterval(scoreInterval);
  }, [isGameStarted, isGameOver, isPaused]);

  // Update the elapsed time every second
  useEffect(() => {
    if (!isGameStarted || isGameOver || isPaused) return;

    const timeInterval = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1); // Increment time every second
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isGameStarted, isGameOver, isPaused]);

  // Add score to total score when game is over
  useEffect(() => {
    if (isGameOver) {
      setTotalScore((prevTotalScore) => {
        const addedScore = Math.floor(score) > 101 ? 101 : Math.floor(score);
        return prevTotalScore + addedScore;
      });
    }
  }, [isGameOver, score]);

  return (
    <div className="div1" onClick={handleJump}>
      <div className="background">
        <img className="bgpic" src={backgroundImage} alt="Game Background" />
      </div>
      <div className={`path-container ${isGameStarted && !isPaused && !isGameOver ? 'animate-path' : ''}`}>
        <div className="path" style={{ backgroundImage: `url(${pathImage})` }}></div>
      </div>
      {isGameStarted && !isGameOver && (
        <div className="score-board">Score: {Math.floor(score)}</div>
      )}
      <img
        className={`chpic ${isJumping ? 'jump' : ''}`}
        src={characterImage}
        alt="Character"
      />
      {obstacles.map(obstacle => (
        <img
          key={obstacle.id}
          id={obstacle.id}
          src={obstacle.image}
          alt="Obstacle"
          className={`${obstacle.className} ${!isGameOver ? 'animate-obstacle' : ''}`}
          style={{
            left: obstacle.left,
            animationDuration: obstacle.animationDuration
          }}
        />
      ))}
      {!isGameStarted && !isGameOver && !showWithdrawScreen && (
        <>
          <button className="withdraw-button" onClick={handleWithdraw}>Withdraw</button>
          <button className="start-button" onClick={handleStart}>Start Game</button>
        </>
      )}
      {isGameOver && (
        <div className="overlay">
          <p className="game-over-text">Game Over</p>
          <p className="score-display">Score: {Math.floor(score)}</p>
          <p className="total-score-display">Total Score: {Math.floor(totalScore)}</p>
          <button className="retry-button" onClick={handleRetry}>Retry</button>
          <button className="retry-button" onClick={handleQuit}>Home</button>
        </div>
      )}
      
      {showWithdrawScreen && (
        <div className="overlay">
          <p className="game-over-text">Total Score: {totalScore}</p>
          <input 
            type="text" 
            placeholder="Type your Bkash number" 
            value={message}
            onChange={handleMessageChange}
            className="wallet-placeholder"
          />
          <button className="start-button withdraw-style" onClick={handleWithdraw}>Withdraw</button>
          <button className="home-button" onClick={() => setShowWithdrawScreen(false)}>Home</button>
        </div>
      )}
      {isGameStarted && !isGameOver && !isPaused && (
        <>
          <button className="pause-button" onClick={handlePause}>II</button>
          <p className='tap-anywhere'>tap anywhere</p>
        </>
      )}
      {isPaused && (
        <div className="overlay">
          <p className="pause-text">Paused</p>
          <button className="resume-button" onClick={handleResume}>Resume</button>
          <button className="quit-button" onClick={handleQuit}>Quit</button>
        </div>
      )}
      {/* Add Withdraw button to top-left corner of start screen */}
      {!isGameStarted && !isGameOver && !showWithdrawScreen && (
        <button className="withdraw-button-top-left" onClick={() => setShowLoginOverlay(true)}>Log</button>
      )}
      
      {/* Login Overlay */}
      {showLoginOverlay && (
        <div className="login-overlay">
          <div className="login-container">
            <p className="login-text">Login to Continue</p>
            <button className="login-button" onClick={handleLogin}>Login with Google</button>
            <button className="home-button" onClick={() => setShowLoginOverlay(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
