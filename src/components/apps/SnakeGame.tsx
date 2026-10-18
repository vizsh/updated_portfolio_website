import React, { useState, useEffect, useRef, useCallback } from 'react';
import { retroAudio } from '../../services/audio';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 10, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro_snake_high_score');
      return saved ? parseInt(saved, 10) : 120;
    }
    return 120;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(110); // ms per step

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  // Generate random food not on snake
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const onSnake = currentSnake.some(seg => seg.x === x && seg.y === y);
      if (!onSnake) return { x, y };
    }
  }, []);

  // Reset game
  const resetGame = () => {
    retroAudio.playMouseDown();
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    directionRef.current = 'UP';
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setSpeed(110);
    setFood({ x: 10, y: 5 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && directionRef.current !== 'DOWN') {
        e.preventDefault();
        setDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && directionRef.current !== 'UP') {
        e.preventDefault();
        setDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && directionRef.current !== 'RIGHT') {
        e.preventDefault();
        setDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && directionRef.current !== 'LEFT') {
        e.preventDefault();
        setDirection('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game tick
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const curDir = directionRef.current;
        let newHead: Point;

        if (curDir === 'UP') newHead = { x: head.x, y: head.y - 1 };
        else if (curDir === 'DOWN') newHead = { x: head.x, y: head.y + 1 };
        else if (curDir === 'LEFT') newHead = { x: head.x - 1, y: head.y };
        else newHead = { x: head.x + 1, y: head.y };

        // Wall collision check
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          retroAudio.playGameOver();
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setIsGameOver(true);
          retroAudio.playGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat food check
        if (newHead.x === food.x && newHead.y === food.y) {
          retroAudio.playSnakeEat();
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('retro_snake_high_score', nextScore.toString());
            }
            return nextScore;
          });
          // Speed up slightly as snake grows
          setSpeed(sp => Math.max(65, sp - 2));
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [food, isGameOver, isPaused, speed, highScore, generateFood]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#c0c0c0',
        padding: '6px',
        userSelect: 'none'
      }}
    >
      {/* Top Status Panel */}
      <div
        className="win-inset"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: '#000000',
          color: '#39ff14',
          fontFamily: 'monospace',
          fontSize: '13px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}
      >
        <div>SCORE: <span style={{ color: '#ffffff' }}>{score.toString().padStart(4, '0')}</span></div>
        <div>HIGH: <span style={{ color: '#ffca3a' }}>{highScore.toString().padStart(4, '0')}</span></div>
        <button
          className="win-outset"
          onClick={() => {
            retroAudio.playMouseDown();
            setIsPaused(p => !p);
          }}
          style={{
            padding: '2px 8px',
            fontSize: '11px',
            fontFamily: 'var(--font-retro)',
            cursor: 'pointer'
          }}
        >
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      {/* Retro VGA Playfield */}
      <div
        className="win-inset"
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#051108',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          aspectRatio: '1 / 1',
          margin: '0 auto',
          width: '100%',
          maxWidth: '380px',
          maxHeight: '380px',
          boxShadow: 'inset 0 0 10px rgba(0, 255, 65, 0.2)'
        }}
      >
        {/* Render Snake */}
        {snake.map((seg, idx) => (
          <div
            key={idx}
            style={{
              gridColumnStart: seg.x + 1,
              gridRowStart: seg.y + 1,
              backgroundColor: idx === 0 ? '#39ff14' : '#00aa00',
              border: '1px solid #051108',
              borderRadius: idx === 0 ? '2px' : '0'
            }}
          />
        ))}

        {/* Render Food */}
        <div
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
            backgroundColor: '#ff0055',
            borderRadius: '50%',
            boxShadow: '0 0 6px #ff0055'
          }}
        />

        {/* Game Over Overlay */}
        {isGameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              color: '#ff3333'
            }}
          >
            <div style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold' }}>GAME OVER</div>
            <div style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>Final Score: {score}</div>
            <button
              className="win-outset"
              onClick={resetGame}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: '#c0c0c0',
                color: '#000000'
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch / Mobile D-Pad Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px'
        }}
      >
        <button
          className="win-outset"
          onClick={() => {
            if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          }}
          style={{ width: '42px', height: '36px', fontSize: '16px', cursor: 'pointer' }}
          aria-label="Move Left"
        >
          &larr;
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            className="win-outset"
            onClick={() => {
              if (directionRef.current !== 'DOWN') setDirection('UP');
            }}
            style={{ width: '42px', height: '36px', fontSize: '16px', cursor: 'pointer' }}
            aria-label="Move Up"
          >
            &uarr;
          </button>
          <button
            className="win-outset"
            onClick={() => {
              if (directionRef.current !== 'UP') setDirection('DOWN');
            }}
            style={{ width: '42px', height: '36px', fontSize: '16px', cursor: 'pointer' }}
            aria-label="Move Down"
          >
            &darr;
          </button>
        </div>

        <button
          className="win-outset"
          onClick={() => {
            if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          }}
          style={{ width: '42px', height: '36px', fontSize: '16px', cursor: 'pointer' }}
          aria-label="Move Right"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};
