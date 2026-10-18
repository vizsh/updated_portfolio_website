import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { retroAudio } from '../../services/audio';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const MINES_COUNT = 10;

export const Minesweeper: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [flagsRemaining, setFlagsRemaining] = useState(MINES_COUNT);

  // Initialize or reset game
  const resetGame = useCallback(() => {
    retroAudio.playMouseDown();
    setGameOver(false);
    setGameWon(false);
    setTimer(0);
    setTimerActive(false);
    setFlagsRemaining(MINES_COUNT);

    // Build empty board
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          isMine: false,
          revealed: false,
          flagged: false,
          neighborMines: 0
        });
      }
      newGrid.push(row);
    }

    // Plant random mines
    let planted = 0;
    while (planted < MINES_COUNT) {
      const rr = Math.floor(Math.random() * ROWS);
      const cc = Math.floor(Math.random() * COLS);
      if (!newGrid[rr][cc].isMine) {
        newGrid[rr][cc].isMine = true;
        planted++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && !gameOver && !gameWon) {
      interval = setInterval(() => {
        setTimer(t => Math.min(999, t + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver, gameWon]);

  // Reveal cell recursively
  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon) return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if (!timerActive) {
      setTimerActive(true);
    }

    const nextGrid = grid.map(row => row.map(item => ({ ...item })));

    if (cell.isMine) {
      // Stepped on a mine -> lose
      retroAudio.playBeep(200, 0.3);
      setGameOver(true);
      setTimerActive(false);

      // Reveal all mines
      nextGrid.forEach(row => {
        row.forEach(item => {
          if (item.isMine) item.revealed = true;
        });
      });
      setGrid(nextGrid);
      return;
    }

    // Flood fill algorithm for zero-neighbor cells
    const flood = (cr: number, cc: number) => {
      if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) return;
      const target = nextGrid[cr][cc];
      if (target.revealed || target.flagged || target.isMine) return;

      target.revealed = true;
      if (target.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(cr + dr, cc + dc);
          }
        }
      }
    };

    flood(r, c);
    retroAudio.playMouseDown();

    // Check win condition
    let unrevealedSafeCells = 0;
    nextGrid.forEach(row => {
      row.forEach(item => {
        if (!item.isMine && !item.revealed) {
          unrevealedSafeCells++;
        }
      });
    });

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      setTimerActive(false);
      retroAudio.playStartup();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }

    setGrid(nextGrid);
  };

  // Flag cell
  const flagCell = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon) return;
    const cell = grid[r][c];
    if (cell.revealed) return;

    retroAudio.playBeep(600, 0.04);
    const nextGrid = grid.map(row => row.map(item => ({ ...item })));
    const target = nextGrid[r][c];

    if (!target.flagged && flagsRemaining > 0) {
      target.flagged = true;
      setFlagsRemaining(prev => prev - 1);
    } else if (target.flagged) {
      target.flagged = false;
      setFlagsRemaining(prev => prev + 1);
    }
    setGrid(nextGrid);
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return '#0000ff';
      case 2: return '#008000';
      case 3: return '#ff0000';
      case 4: return '#000080';
      case 5: return '#800000';
      case 6: return '#008080';
      case 7: return '#000000';
      default: return '#808080';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        backgroundColor: '#c0c0c0',
        height: '100%'
      }}
    >
      <div className="win-outset" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Top Header Display: Mine Counter | Smiley | Timer */}
        <div
          className="win-inset"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            backgroundColor: '#c0c0c0'
          }}
        >
          {/* Flags / Mines Left */}
          <div
            style={{
              backgroundColor: '#000000',
              color: '#ff0000',
              fontFamily: 'monospace',
              fontSize: '22px',
              fontWeight: 'bold',
              padding: '1px 6px',
              letterSpacing: '2px',
              minWidth: '54px',
              textAlign: 'center'
            }}
          >
            {String(Math.max(0, flagsRemaining)).padStart(3, '0')}
          </div>

          {/* Smiley Reset Button */}
          <button
            className="win-button"
            onClick={resetGame}
            style={{
              width: '32px',
              height: '32px',
              fontSize: '18px',
              padding: 0
            }}
            title="Reset Game"
          >
            {gameWon ? '😎' : gameOver ? '😵' : isPressing ? '😮' : '🙂'}
          </button>

          {/* Timer */}
          <div
            style={{
              backgroundColor: '#000000',
              color: '#ff0000',
              fontFamily: 'monospace',
              fontSize: '22px',
              fontWeight: 'bold',
              padding: '1px 6px',
              letterSpacing: '2px',
              minWidth: '54px',
              textAlign: 'center'
            }}
          >
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Minesweeper Grid */}
        <div
          className="win-inset"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 24px)`,
            gridTemplateRows: `repeat(${ROWS}, 24px)`,
            gap: '1px',
            backgroundColor: '#808080',
            padding: '3px'
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={e => flagCell(e, r, c)}
                onMouseDown={() => !cell.revealed && setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                className={cell.revealed ? 'win-inset' : 'win-outset'}
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  fontFamily: 'sans-serif',
                  cursor: cell.revealed ? 'default' : 'pointer',
                  backgroundColor: cell.revealed ? (cell.isMine ? '#ff4d4d' : '#c0c0c0') : '#c0c0c0',
                  color: cell.revealed && cell.neighborMines > 0 ? getNumberColor(cell.neighborMines) : '#000'
                }}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    cell.neighborMines
                  ) : null
                ) : cell.flagged ? (
                  '🚩'
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
