'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';

const FRUITS_MASTER = [
  '🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉',
  '🍐', '🍑', '🍋', '🍈', '🍏', '🍊', '🫐', '🥥',
  '🥑', '🌽', '🥕', ' eggplant ', '🍅', '🍄', '🥦', '🧅'
];

const GAS_URL = "https://script.google.com/macros/s/AKfycbwGNSCqOsk3ijtw51WS2WLQV0Sgd_ucwQhMBGrfd2m549nTjff3fHjbYJgM2h_q8v_ICw/exec";

interface CardData {
  id: number;
  fruit: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Ranking {
  name: string;
  time: string;
  rawTime?: number;
  rank?: number;
  timestamp?: string;
}

type GameState = 'ENTRY' | 'PEEK' | 'PLAYING' | 'FINISHED';

// Separated SettingsModal
interface SettingsModalProps {
  peekTime: number;
  setPeekTime: (val: number) => void;
  gridSize: number;
  setGridSize: (val: number) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ peekTime, setPeekTime, gridSize, setGridSize, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in">
    <div className="bg-white p-10 rounded-[40px] shadow-2xl w-[400px] flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#1A4D2E]">게임 설정</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">미리보기 시간 ({peekTime}초)</span>
          <input
            type="range" min="0" max="10" step="0.5"
            value={peekTime}
            onChange={(e) => setPeekTime(parseFloat(e.target.value))}
            className="accent-[#7CFF01] cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">카드 격자 크기 ({gridSize}x{gridSize})</span>
          <div className="flex gap-2">
            {[4, 5, 6, 8].map(size => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${gridSize === size ? 'bg-[#7CFF01] text-[#1A4D2E]' : 'bg-gray-100 text-gray-400'}`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onClose} className="w-full btn-start py-4 text-center justify-center">확인</button>
    </div>
  </div>
);

const CardGame: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState>('ENTRY');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [clicks, setClicks] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [gridSize, setGridSize] = useState(4);
  const [peekTime, setPeekTime] = useState(2.5);

  const gameSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Rankings from Spreadsheet
  const fetchRankingsFromSheet = useCallback(async () => {
    try {
      // Use a controller to timeout if needed or handle network errors more gracefully
      // 캐시 방지를 위해 타임스탬프 추가
      const response = await fetch(`${GAS_URL}?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      let data = await response.json();
      if (!data) return;

      // 2D 배열 형식을 객체 배열 형식으로 변환 (헤더 포함 대응)
      let list: any[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && Array.isArray(data[0])) {
          // 헤더가 있는 2D 배열인 경우
          const headers = data[0].map((h: string) => String(h).toLowerCase().replace(/\s/g, ''));
          list = data.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
            return obj;
          });
        } else {
          list = data;
        }
      }

      const processed = list.map(item => {
        // 모든 필드명을 소문자와 하이픈 제거 후 비교하여 유연하게 데이터 추출
        const getField = (keys: string[]) => {
          for (const k of keys) {
            const normalizedK = k.toLowerCase().replace(/[-_\s]/g, '');
            for (const itemKey in item) {
              if (itemKey.toLowerCase().replace(/[-_\s]/g, '') === normalizedK) return item[itemKey];
            }
          }
          return '';
        };

        const rawTimeStr = getField(['finish-time', 'finishtime', 'time']);
        const name = getField(['user-name', 'username', 'name', 'userName', 'playerName']);
        
        const isTimeDuration = rawTimeStr && typeof rawTimeStr === 'string' && (rawTimeStr.includes('분') || rawTimeStr.includes('초'));
        const clearTime = isTimeDuration ? String(rawTimeStr) : '0초';

        let seconds = 0;
        const matches = clearTime.match(/(\d+)분\s*(\d+)초/);
        if (matches) {
          seconds = parseInt(matches[1]) * 60 + parseInt(matches[2]);
        } else {
          const secMatch = clearTime.match(/(\d+)초/);
          if (secMatch) seconds = parseInt(secMatch[1]);
        }

        return { 
          ...item, 
          name: name || '익명',
          time: clearTime,
          rawTime: seconds 
        };
      })
        .filter(item => item.rawTime > 0) // 유효하지 않은 데이터 제외
        .sort((a, b) => (a.rawTime || 999999) - (b.rawTime || 999999))
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      setRankings(processed);
      localStorage.setItem('cardGameRankingsV4_KR', JSON.stringify(processed));
    } catch (e) {
      // Silent warning for dev mode
      console.warn("연결 확인 중... (리더보드 준비 중)");
      // Fallback to local storage
      const saved = localStorage.getItem('cardGameRankingsV4_KR');
      if (saved) setRankings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    fetchRankingsFromSheet();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchRankingsFromSheet, 30000);
    return () => clearInterval(interval);
  }, [fetchRankingsFromSheet]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'PLAYING' && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  // Scroll to game area when game starts
  useEffect(() => {
    if ((gameState === 'PEEK' || gameState === 'PLAYING') && gameSectionRef.current) {
      gameSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [gameState]);

  const initGame = useCallback(() => {
    if (!playerName.trim()) {
      setGameState('ENTRY');
      alert('사용자 이름을 입력해 주세요!');
      return;
    }
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    const selectedFruits = FRUITS_MASTER.slice(0, pairCount);
    const gameFruits = [...selectedFruits, ...selectedFruits]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((fruit, index) => ({
        id: index,
        fruit,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameFruits);
    setClicks(0);
    setTimer(0);
    setScore(0);
    setFlippedCards([]);
    setIsPaused(false);
    setGameState('PEEK');
    setTimeout(() => { setGameState('PLAYING'); }, peekTime * 1000);
  }, [gridSize, peekTime, playerName]);

  const finishGame = async (finalTimer: number, finalScore: number) => {
    if (gameState === 'FINISHED') return;
    setGameState('FINISHED');
    const timeStr = `${Math.floor(finalTimer / 60)}분 ${(finalTimer % 60).toString().padStart(2, '0')}초`;
    
    // YYYY-MM-DD-HH 형식의 타임스탬프 생성
    const now = new Date();
    const tsStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`;

    try {
      // 가장 확실한 방법인 GET 파라미터를 활용한 전송 시도
      const queryParams = new URLSearchParams({
        'timestamp': tsStr,
        'user-name': playerName,
        'finish-time': timeStr
      }).toString();

      await fetch(`${GAS_URL}?${queryParams}`, {
        method: 'GET',
        mode: 'no-cors'
      });
      
      console.log("데이터 전송 시도(GET):", { tsStr, playerName, timeStr });
      
      // 즉시 리프레시 시도 (약간의 지연 후)
      setTimeout(fetchRankingsFromSheet, 2000);
      setTimeout(fetchRankingsFromSheet, 5000);
    } catch (error) {
      console.error("전송 에러:", error);
    }
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && cards.length > 0 && cards.every(card => card.isMatched)) {
      finishGame(timer, score);
    }
  }, [cards, gameState, timer, score]);

  const handleCardClick = (id: number) => {
    if (gameState !== 'PLAYING' || isPaused || flippedCards.length === 2 || cards[id].isMatched || cards[id].isFlipped) return;
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    setClicks((prev) => prev + 1);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].fruit === cards[secondId].fruit) {
        setTimeout(() => {
          setCards(prev => prev.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, isMatched: true, isFlipped: true } : card
          ));
          setFlippedCards([]);
          setScore((prev) => prev + 500);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Vertical Navigation Item Component
  const NavItem = ({ label, onClick, isActive }: { label: string, onClick: () => void, isActive?: boolean }) => (
    <button
      onClick={onClick}
      className={`text-left font-black transition-all hover:translate-x-1 ${isActive ? 'text-[#1A4D2E]' : 'text-gray-400 hover:text-[#1A4D2E]'}`}
    >
      {label}
    </button>
  );

  const FullLeaderboard = () => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in p-6">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-10 flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-3xl font-black text-[#1A4D2E]">명예의 전당</h2>
            <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Global Top Rankings</p>
          </div>
          <button onClick={() => setShowFullLeaderboard(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-4">
          {rankings.map((rank, idx) => (
            <div key={idx} className={`flex items-center justify-between p-6 rounded-[24px] ${idx < 3 ? 'bg-[#7CFF01]/10 border border-[#7CFF01]' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-black text-[#1A4D2E] opacity-30 w-8">{idx + 1}</span>
                <div className="flex flex-col">
                  {/* 날짜 대신 이름을 크게, 클리어 시간을 아래에 표시 */}
                  <span className="text-2xl font-black text-[#1A4D2E]">
                    {rank.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-tight">{rank.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end opacity-20">
                <span className="text-2xl font-black">#{idx + 1}</span>
              </div>
            </div>
          ))}
          {rankings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <span className="text-6xl">🏆</span>
              <span className="font-bold">아직 기록이 없습니다. 첫 주인공이 되어보세요!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Navigation (Responsive) */}
      <aside className="xl:w-64 xl:h-full w-full h-auto xl:border-r border-t xl:border-t-0 border-gray-100 flex xl:flex-col flex-row items-center xl:items-start justify-between xl:justify-start p-6 xl:p-10 fixed bottom-0 xl:top-0 left-0 bg-white/90 backdrop-blur-md xl:bg-white z-[100] shadow-lg xl:shadow-none">
        <div className="text-xl xl:text-2xl font-black text-[#1A4D2E] hidden xl:block mb-12">프루트 팝</div>
        <div className="flex xl:flex-col flex-row gap-6 xl:gap-6 text-sm xl:text-lg w-full xl:w-auto justify-around xl:justify-start items-center">
          <NavItem label="게임" onClick={() => setGameState('ENTRY')} isActive={gameState !== 'FINISHED'} />
          <NavItem label="랭킹" onClick={() => setShowFullLeaderboard(true)} />
          <NavItem label="설정" onClick={() => setShowSettings(true)} />
          <button onClick={() => setIsPaused(!isPaused)} className="xl:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-lg">
            {isPaused ? '▶' : '⏸'}
          </button>
        </div>
        <div className="mt-auto hidden xl:flex flex-col gap-4">
          <button onClick={() => setIsPaused(!isPaused)} className="w-full flex items-center gap-3 font-bold text-gray-500 hover:text-[#1A4D2E] transition-colors">
            {isPaused ? '▶ 이어하기' : '⏸ 일시정지'}
          </button>
          <button onClick={() => playerName.trim() ? initGame() : alert('이름을 먼저 입력해 주세요!')} className="w-full flex items-center gap-3 font-bold text-gray-500 hover:text-[#1A4D2E] transition-colors">
            ↻ 보드 초기화
          </button>
        </div>
      </aside>

      <div className="flex-1 xl:ml-64 flex flex-col items-center pb-32 xl:pb-0">
        {showSettings && (
          <SettingsModal peekTime={peekTime} setPeekTime={setPeekTime} gridSize={gridSize} setGridSize={setGridSize} onClose={() => setShowSettings(false)} />
        )}
        {showFullLeaderboard && <FullLeaderboard />}

        <main className="max-w-5xl w-full px-12 py-16 flex flex-col items-center gap-20">
          {/* Hero Section */}
          <section className="text-center flex flex-col items-center gap-6 xl:gap-8 animate-in w-full">
            <span className="hero-tag">새로운 시즌</span>
            <h1 className="title-text !text-4xl xl:!text-7xl px-4">수확의<br />기억.</h1>
            <p className="max-w-md text-gray-500 font-medium leading-relaxed text-sm xl:text-lg px-6">
              더욱 정교해진 과일 짝맞추기 게임을 즐겨보세요.<br />
              카드를 뒤집어 짝을 찾고 순위권에 도전하세요.
            </p>
            <div className="flex flex-col xl:flex-row gap-4 items-center mt-4 w-full px-6">
              <input
                type="text" placeholder="사용자 이름을 입력하세요" value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="input-name transition-all focus:ring-2 focus:ring-[#7CFF01] w-full xl:!w-80 !h-14 xl:!h-16 !text-base xl:!text-lg !px-8"
              />
              <button onClick={initGame} className="btn-start w-full xl:w-auto !h-14 xl:!h-16 !px-10 !text-base xl:!text-lg shadow-lg shadow-[#1A4D2E]/20">
                시작 <span className="ml-2">→</span>
              </button>
            </div>
          </section>

          {/* Game Area */}
          <section ref={gameSectionRef} className="w-full flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-center animate-in" style={{ animationDelay: '200ms' }}>
            {/* Left Sidebar Stats */}
            <div className="flex xl:flex-col flex-row gap-4 xl:gap-8 xl:w-56 w-full bg-white/70 p-6 xl:p-10 rounded-[32px] xl:rounded-[40px] border border-white shadow-sm overflow-x-auto min-w-0">
              <div className="sidebar-stat flex-1 min-w-[80px]">
                <span className="stat-label text-[10px] xl:text-xs">현재 점수</span>
                <span className="stat-value text-xl xl:text-3xl">{score.toLocaleString()}</span>
              </div>
              <div className="sidebar-stat flex-1 min-w-[80px]">
                <span className="stat-label text-[10px] xl:text-xs">시도 횟수</span>
                <span className="stat-value text-xl xl:text-3xl">{clicks}</span>
              </div>
              <div className="sidebar-stat flex-1 min-w-[80px]">
                <span className="stat-label text-[10px] xl:text-xs">경과 시간</span>
                <span className="stat-value text-xl xl:text-3xl">{formatTimer(timer)}</span>
              </div>
            </div>

            {/* Center Card Grid */}
            <div className="flex flex-col gap-8 relative w-full px-4 xl:px-0">
              <div className="w-full max-w-[720px] aspect-square flex items-center justify-center bg-[#EBEBEB] p-4 xl:p-10 rounded-[40px] xl:rounded-[64px] shadow-inner relative overflow-hidden border-4 xl:border-8 border-white/50 mx-auto">
                <div
                  className={`grid gap-4 w-full h-full transition-all duration-300 ${(isPaused || gameState === 'FINISHED') ? 'blur-xl opacity-30 scale-90' : ''}`}
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                >
                  {cards.length > 0 ? (
                    cards.map((card) => (
                      <Card key={card.id} fruit={card.fruit} isFlipped={gameState === 'PEEK' || card.isFlipped} isMatched={card.isMatched} onClick={() => handleCardClick(card.id)} gridSize={gridSize} />
                    ))
                  ) : (
                    Array(gridSize * gridSize).fill(0).map((_, idx) => (
                      <div key={idx} className="w-full h-full bg-[#7CFF01] rounded-[24px] shadow-sm opacity-5"></div>
                    ))
                  )}
                </div>
                {isPaused && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <button onClick={() => setIsPaused(false)} className="bg-[#1A4D2E] text-[#7CFF01] text-2xl font-black py-8 px-16 rounded-[40px] shadow-2xl hover:scale-110 transition-transform active:scale-95 animate-in">계속하려면 클릭</button>
                  </div>
                )}
                {gameState === 'FINISHED' && (
                  <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-md animate-in p-12">
                    <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md p-10 flex flex-col items-center gap-8 border border-white/50">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block">🎉</span>
                        <h2 className="text-3xl font-black text-[#1A4D2E]">수확 성공!</h2>
                        <p className="text-gray-400 font-bold mt-1 tracking-tight">게임 완료를 축하합니다!</p>
                      </div>
                      
                      <div className="w-full flex flex-col gap-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-2">TOP 3 RANKINGS</div>
                        {rankings.slice(0, 3).map((rank, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${idx === 0 ? 'bg-[#7CFF01] text-[#1A4D2E]' : 'bg-gray-50 text-[#1A4D2E] border border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                              <span className="font-black opacity-40">{idx + 1}</span>
                              <span className="font-black truncate max-w-[100px]">{rank.name}</span>
                            </div>
                            <span className="font-bold text-sm tracking-tighter">{rank.time}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col w-full gap-3 mt-4">
                        <button 
                          onClick={initGame}
                          className="w-full py-5 bg-[#7CFF01] text-[#1A4D2E] rounded-3xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#7CFF01]/30"
                        >
                          다시하기
                        </button>
                        <button 
                          onClick={() => setGameState('ENTRY')}
                          className="w-full py-5 bg-gray-100 text-gray-500 rounded-3xl font-black text-lg hover:bg-gray-200 transition-all"
                        >
                          처음으로
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mini Leaderboard on right */}
            <div className="flex flex-col gap-6 w-full xl:w-80 bg-white/70 p-6 xl:p-10 rounded-[32px] xl:rounded-[40px] border border-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg xl:text-xl font-black text-[#1A4D2E]">Top 5</span>
                <button onClick={() => setShowFullLeaderboard(true)} className="text-[10px] font-black text-[#1A4D2E]/40 hover:text-[#1A4D2E] uppercase tracking-widest transition-colors">전체보기</button>
              </div>
              <div className="flex flex-col gap-3">
                {rankings.slice(0, 5).map((rank, idx) => (
                  <div key={idx} className={`leaderboard-item ${idx === 0 ? 'rank-1' : ''} !p-4 !rounded-2xl shadow-sm transition-transform hover:scale-[1.05]`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[10px] shadow-sm">{idx + 1}</div>
                        <span className="text-[14px] font-black text-[#1A4D2E]">{rank.name}</span>
                      </div>
                      <span className="text-[12px] font-bold text-gray-400 truncate max-w-[120px] text-right">{rank.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <footer className="py-20 text-gray-400 text-[12px] font-bold uppercase tracking-[0.3em] text-center w-full">
          © 2026 수확의 기억. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default CardGame;
