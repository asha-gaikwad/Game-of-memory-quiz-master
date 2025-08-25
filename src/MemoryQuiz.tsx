
import { useEffect, useRef, useState } from 'react';
import CardItem from './CardItem';
import ParticlesBackground from './particlesBackground';
import toast, { Toaster } from 'react-hot-toast';

export type GameState = {
  pair: number[],
  flipped: number[]
};

const shuffleArray = (arr: number[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const MemoryQuiz = () => {
  const levelOneList = Array.from({ length: 10 }, (_, i) => i).flatMap(i => [i, i]);
  const levelTwoList = Array.from({ length: 20 }, (_, i) => i).flatMap(i => [i, i]);
  const levelThreeList = Array.from({ length: 30 }, (_, i) => i).flatMap(i => [i, i]);

  const [username, setUsername] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);


  type UserResult = {
    username: string;
    score: number;
    time: number;
    date: string;
    level: number;
    won: boolean;
  };
  type CardPair = {
    index: number;
    value: number;
  };


  const [level, setLevel] = useState(1);
  const [cardList, setCardList] = useState<number[]>(shuffleArray(levelOneList));
  const [state, setState] = useState<{
    pair: CardPair[];
    flipped: number[];
  }>({
    pair: [],
    flipped: [],
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [levelOneComplete, setLevelOneComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const clickSound = new Audio('assets/sounds/click1.mp3');
  const matchSound = new Audio('assets/sounds/match.mp3');
  const gameOverSound = new Audio('assets/sounds/gameOver.mp3');
  const startGameSound = new Audio('assets/sounds/gameStart.mp3');
  const winSound = new Audio('assets/sounds/winning.mp3');
  const levelUpSound = new Audio('assets/sounds/levelUp.mp3');
  const lockRef = useRef(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (gameStarted && !gameOver && !isPaused) {
      timer = setInterval(() => {
        setTime(prev => {
          const newTime = prev - 1;

          if (newTime <= 5 && newTime > 0) {
            setCountdown(newTime);
            setTimeout(() => setCountdown(null), 900);
          }

          if (newTime <= 0) {
            clearInterval(timer!);
            setGameOver(true);
            return 0;
          }

          return newTime;
        });

        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameOver, isPaused]);

  const today = new Date().toDateString();
  const todayResults = userResults
    .filter(r => r.date === today)
    .sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);



  const setCardState = (cardIndex: number, cardValue: number) => {
    if (!gameStarted) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }

    // 🛑 Prevent flip if board is locked
    if (lockRef.current) return;

    clickSound.play();

    if (state.flipped.includes(cardIndex)) return;

    if (isPaused) {
      if (state.pair.length === 0) {
        setState({ pair: [{ index: cardIndex, value: cardValue }], flipped: [...state.flipped] });
      }
      return;
    }

    let { pair, flipped } = state;

    if (pair.length === 1) {
      const prev = pair[0];

      // 🔒 Lock the board to prevent 3rd card click
      lockRef.current = true;

      if (prev.value === cardValue && prev.index !== cardIndex) {
        // ✅ Match
        const newFlipped = [...flipped, prev.index, cardIndex];
        setState({ pair: [], flipped: newFlipped });

        matchSound.play();

        setTimeout(() => {
          lockRef.current = false;
          setScore(prevScore => {
            const newScore = prevScore + 1;
            const totalUnique = new Set(cardList).size;

            if (newFlipped.length === cardList.length) {
              if (level === 1) {
                setLevelOneComplete(true);
                setGameOver(true);
              } else {
                setGameOver(true);
              }
            }

            return newScore;
          });
        }, 500);
      } else {
        // ❌ Not a match
        setTimeout(() => {
          lockRef.current = false;
          setState({ pair: [], flipped });
        }, 1000); // delay for showing both cards
        setState({ pair: [prev, { index: cardIndex, value: cardValue }], flipped });
      }
    } else {
      setState({ pair: [{ index: cardIndex, value: cardValue }], flipped });
    }
  };



  useEffect(() => {
    if (gameOver) {
      const performance = evaluatePerformance();

      if (performance.level === 'Perfect!' || performance.level === 'Great!') {
        winSound.play();
      } else {
        gameOverSound.play();
      }

      const currentLevel = level; // capture it right here
      const result = {
        username,
        score,
        time: elapsedTime,
        date: new Date().toDateString(),
        level: currentLevel,
        won: score === new Set(cardList).size,
      };


      // Save to state and localStorage
      setUserResults(prev => {
        const updatedResults = [...prev, result];
        localStorage.setItem('memory_game_results', JSON.stringify(updatedResults));
        return updatedResults;
      });
    }
  }, [gameOver]);




  useEffect(() => {
    // Load results from localStorage on mount
    const savedResults = localStorage.getItem('memory_game_results');
    if (savedResults) {
      setUserResults(JSON.parse(savedResults));
    }
  }, []);




  useEffect(() => {
    const audio = backgroundMusicRef.current;

    if (audio) {
      const tryPlay = () => {
        audio.muted = false;
        audio.volume = 0.5;
        audio.loop = true;
        audio.play().catch(err => {
          console.warn('Autoplay blocked. Waiting for user interaction...', err);
          document.body.addEventListener('click', () => {
            audio.play().catch(err => console.warn('Still blocked:', err));
          }, { once: true });
        });
      };

      tryPlay();
    }
  }, []);



  // const handlePlay = () => {
  //   if (backgroundMusicRef.current) {
  //     backgroundMusicRef.current.pause();
  //     backgroundMusicRef.current.currentTime = 0;
  //   }

  //   startGameSound.play();

  //   const cardSet = level === 3 ? levelThreeList : level === 2 ? levelTwoList : levelOneList;
  //   const timeSet = level === 3 ? 180 : level === 2 ? 120 : 60;

  //   setGameStarted(true);
  //   setGameOver(false);
  //   setCardList(shuffleArray(cardSet));
  //   setTime(timeSet);
  //   setScore(0);
  //   setElapsedTime(0);
  //   setState({ pair: [], flipped: [] });
  //   setLevelOneComplete(false);
  // };

  const handlePlay = () => {
    if (!username.trim()) {
      toast.error('Please enter your name!');
      const errorSound = new Audio('/public/assets/sounds/error.mp3');
      errorSound.play();
      return;
    }

    startGameSound.play();

    const cardSet = level === 3 ? levelThreeList : level === 2 ? levelTwoList : levelOneList;
    const timeSet = level === 3 ? 210 : level === 2 ? 120 : 60;

    setGameStarted(true);
    setGameOver(false);
    setCardList(shuffleArray(cardSet));
    setTime(timeSet);
    setScore(0);
    setElapsedTime(0);
    setState({ pair: [], flipped: [] });
    setLevelOneComplete(false);
  };




  const handleNextLevel = () => {
    levelUpSound.play();
    const nextLevel = level + 1;

    let nextCardList = levelThreeList;
    let nextTime = 210;

    if (nextLevel === 2) {
      nextCardList = levelTwoList;
      nextTime = 120;
    }

    setLevel(nextLevel);
    setCardList(shuffleArray(nextCardList));
    setState({ pair: [], flipped: [] });
    setTime(nextTime);
    setElapsedTime(0);
    setScore(0);
    setGameOver(false);
    setLevelOneComplete(false);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const evaluatePerformance = () => {
    const total = new Set(cardList).size;
    const scoreRatio = score / total;
    const fast = elapsedTime <= 30;
    const ok = elapsedTime <= 50;

    if (scoreRatio === 1 && fast) return { level: 'Perfect!', color: 'text-green-600', icon: '🏆' };
    if (scoreRatio >= 0.6 && ok) return { level: 'Great!', color: 'text-yellow-500', icon: '🥈' };
    return { level: 'Keep Trying!', color: 'text-red-500', icon: '🥉' };
  };

  const renderedList = cardList.map((it, index) => (
    <CardItem
      key={index}
      id={it}
      index={index}
      isFlipped={state.flipped.includes(index)}
      setCardState={setCardState}
      size={level === 1 ? 'small' : level === 2 ? 'smaller' : undefined}

      level={level}
    />

  ));

  const handleGoHome = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setTime(60);
    setElapsedTime(0);
    setState({ pair: [], flipped: [] });
    setLevelOneComplete(false);
    localStorage.removeItem('memory_game_current');
  };


  // const levelResults = userResults
  // .filter((r) => r.level === level && r.date === today)
  // .sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);
  const levelResults: UserResult[] = Object.values(
    userResults
      .filter((r) => r.level === level && r.date === today)
      .reduce((acc: Record<string, UserResult>, curr) => {
        acc[curr.username] = curr;
        return acc;
      }, {})
  ).sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.time - b.time
  );



  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100 text-gray-900 overflow-hidden">

      {!gameStarted ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <ParticlesBackground />
          {/* ✅ Background Music */}
          <audio
            ref={backgroundMusicRef}
            src="/assets/sounds/background.mp3"
            loop
            onCanPlay={() => {
              if (!gameStarted) {
                backgroundMusicRef.current!.play().catch(err => console.warn('Autoplay blocked:', err));
              }
            }}
          />

          <div className="z-10 flex flex-col items-center justify-center gap-6">
            <h2 className="text-4xl font-bold">🧠 Memory Game</h2>
            <div className="flex flex-col items-center gap-4">
              <Toaster position="top-center" reverseOrder={false} />

              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ backgroundColor: '#d4d0cb', color: 'black' }}
                className="px-4 py-2 border border-gray-400 rounded-md "
              />
              <button
                onClick={() => {
                  handlePlay();
                }}
                className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xl"
              >
                ▶ Play
              </button>
            </div>



            {showAlert && (
              <div className="text-red-500 text-sm font-semibold">Please click the play button first!</div>
            )}
          </div>
        </div>
      ) : gameOver ? (
        (() => {
          const performance = evaluatePerformance();
          const isWin = score === new Set(cardList).size; // ✅ Exact score check

          return (
            <div className={`flex font-backso flex-col items-center justify-center gap-4 bg-white shadow-lg rounded-xl p-8 ${isWin ? 'border-4 border-green-400' : 'border-4 border-red-300'}`}>
              <div className={`text-4xl font-bold ${isWin ? 'text-green-600' : 'text-red-500'} text-center`}>
                {isWin ? '🎉 Congratulations!' : '💀 Game Over!'}
              </div>

              <div className="text-lg font-medium text-gray-700">
                {isWin ? `Level ${level} Complete!` : `Level ${level} Not Complete!`}
              </div>

              <div className="text-lg font-medium text-gray-700">Score: {score}/{new Set(cardList).size}</div>
              <div className="text-lg font-medium text-gray-700">⏱️ Time: {formatTime(elapsedTime)}</div>

              <div className={`text-lg font-bold flex items-center gap-2 ${performance.color}`}>
                <span>{performance.icon}</span>
                <span>Performance: {performance.level}</span>
              </div>

              <div className="flex gap-4 mt-4 flex-wrap justify-center">
                {(level === 1 || level === 2) && isWin && (
                  <>
                    <button
                      onClick={handlePlay}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      🔁 Play Again
                    </button>
                    <button
                      onClick={handleNextLevel}
                      className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      ➕ Next Level
                    </button>
                  </>
                )}

                {level === 3 && isWin && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-green-600 text-lg font-bold">
                      🎉 You've completed all levels!
                    </div>
                    <button
                      onClick={handleGoHome}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      🏠 Home
                    </button>
                  </div>
                )}

                {((level === 3 && !isWin) || (level === 2 && !isWin) || (level === 1 && !isWin)) && (
                  <button
                    onClick={handlePlay}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    🔁 Play Again
                  </button>
                )}

                {/* Only show Home button separately if not in level 3 win */}
                {!(level === 3 && isWin) && (
                  <button
                    onClick={handleGoHome}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    🏠 Home
                  </button>
                )}
              </div>


              <div className="mt-8 w-full max-w-3xl bg-gray-100 shadow-lg rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4 text-center text-indigo-600">

                  🏆 Level {level} Results
                </h3>

                <div className="max-h-[240px] overflow-y-auto border border-gray-300 rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase sticky top-0 z-10" style={{ backgroundColor: '#ff8801', color: '#fff' }}>
                      <tr>
                        <th className="px-4 py-2">Rank</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Score</th>
                        <th className="px-4 py-2">
                          {levelResults.some(r => r.time >= 60) ? "Time (m)" : "Time (s)"}
                        </th>
                        <th className="px-4 py-2">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelResults.map((r, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">
                            <div className="truncate max-w-[120px]">
                              {r.username}
                            </div>
                          </td>
                          <td className="px-4 py-2">{r.score}</td>
                          <td className="px-4 py-2">{Math.floor(r.time / 60)}:{(r.time % 60).toString().padStart(2, '0')}</td>
                          <td className="px-4 py-2">{r.won ? "✅ Win" : "❌ Lost"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


              </div>




            </div>

          );
        })()
      ) : (
        <div className="w-full font-backso h-full flex  flex-col px-6 py-5">
          <div className="flex justify-between items-center mb-6 px-4 text-lg font-semibold">
            <div>Level: {level}</div>
            <div>Score: {score}</div>
            <div className="flex items-center gap-4">
              <div className={`${time <= 5 ? 'text-red-600 font-bold text-xl animate-pulse' : 'text-gray-600'}`}>
                ⏱️Time: {formatTime(time)}
              </div>

            </div>
          </div>


          {countdown !== null && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-extrabold text-red-600 animate-ping z-50">
              {countdown}
            </div>
          )}

          <div className="flex items-center justify-center min-h-[80vh]">
            {/* Grid + Button container */}
            <div className="flex gap-6 items-center">
              {/* Card Grid */}
              <div className={`grid ${level === 1 ? 'grid-cols-5' :
                level === 2 ? 'grid-cols-8' :
                  'grid-cols-10'
                } gap-3`}>
                {renderedList}
              </div>


              {/* Vertical Buttons - Centered */}
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Pause Button */}
                <button
                  onClick={() => setIsPaused(prev => !prev)}
                  className={`px-4 py-2 rounded transition-colors ${isPaused
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white`}
                >
                  {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>

                {/* Exit Button */}
                <button
                  onClick={() => {

                    handleGoHome();
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  🏠 Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryQuiz;




