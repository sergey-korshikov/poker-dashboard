import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import { BoardView } from './views/BoardView';
import { StatsView } from './views/StatsView';
import { SetupView } from './views/SetupView';
import { SummaryView } from './views/SummaryView';

export default function App() {
  const [currentView, setCurrentView] = useState('board');
  const { isTimerRunning, toggleTimer, handleNextLevel, handlePrevLevel, showCurrency, setShowCurrency, stats, players } = useGame();

  useEffect(() => {
    if (players.length > 1 && stats.playersInGame === 1) {
      setCurrentView('summary');
    }
  }, [stats.playersInGame, players.length]);

  return (
    <div className='h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased overflow-hidden'>
      {/* ШАПКА */}
      <header className='bg-slate-900 border-b border-slate-800 px-6 h-14 flex justify-between items-center gap-4 shrink-0 z-20'>
        <div className='w-24'>
          <button onClick={() => setShowCurrency(!showCurrency)} className='bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white text-base w-10 h-8 rounded-lg transition flex items-center justify-center cursor-pointer' title={showCurrency ? 'Скрыть валюту' : 'Показать валюту'}>
            {showCurrency ? '👁️' : '🙈'}
          </button>
        </div>

        {/* ИСПРАВЛЕНО: Убран капс с названий вкладок (Табло, Статистика...) */}
        <nav className='flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850 h-9 mx-auto'>
          <button onClick={() => setCurrentView('board')} className={`px-4 h-7 rounded text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'board' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Табло
          </button>
          <button onClick={() => setCurrentView('stats')} className={`px-4 h-7 rounded text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'stats' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Статистика
          </button>
          <button onClick={() => setCurrentView('setup')} className={`px-4 h-7 rounded text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'setup' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Настройки
          </button>
          <button onClick={() => setCurrentView('summary')} className={`px-4 h-7 rounded text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'summary' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Итоги
          </button>
        </nav>

        <div className='w-24' />
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className={`flex-1 p-6 relative ${currentView === 'board' ? 'overflow-hidden' : 'overflow-y-auto'} bg-slate-950`}>
        {currentView === 'board' && <BoardView />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'setup' && <SetupView />}
        {currentView === 'summary' && <SummaryView />}
      </main>

      {/* ПОДВАЛ */}
      <footer className='bg-slate-900 border-t border-slate-800 px-6 h-16 flex justify-center items-center gap-4 shrink-0 z-20'>
        <div className='flex items-center gap-3'>
          <button onClick={handlePrevLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer'>
            Пред. уровень
          </button>

          {/* ИСПРАВЛЕНО: Убран принудительный капс со слов Старт / Пауза */}
          <button onClick={toggleTimer} className={`font-semibold text-sm px-8 h-10 rounded-lg transition active:scale-95 shadow-lg cursor-pointer ${isTimerRunning ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700' : 'bg-white hover:bg-slate-200 text-black scale-105'}`}>
            {isTimerRunning ? 'Пауза' : 'Старт'}
          </button>

          <button onClick={handleNextLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer'>
            След. уровень
          </button>
        </div>
      </footer>
    </div>
  );
}
