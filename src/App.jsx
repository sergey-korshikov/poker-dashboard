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
    /* ИСПРАВЛЕНО: h-screen вместо min-h-screen теперь жестко заперт НА ВСЕХ УСТРОЙСТВАХ. 
       Это гарантирует, что шапка и подвал всегда прикованы к краям дисплея смартфона */
    <div className='h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased overflow-hidden'>
      {/* ЗАФИКСИРОВАННАЯ ШАПКА */}
      <header className='bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-2.5 lg:h-14 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 shrink-0 z-20'>
        <div className='w-full sm:w-24 flex justify-center sm:justify-start'>
          <button onClick={() => setShowCurrency(!showCurrency)} className='bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white text-base w-full sm:w-10 h-8 rounded-lg transition flex items-center justify-center cursor-pointer' title={showCurrency ? 'Скрыть валюту' : 'Показать валюту'}>
            {showCurrency ? '👁️' : '🙈'}
          </button>
        </div>

        <nav className='flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850 h-9 w-full sm:w-auto justify-center'>
          <button onClick={() => setCurrentView('board')} className={`px-3 sm:px-4 lg:px-6 h-7 rounded text-[10px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'board' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Табло
          </button>
          <button onClick={() => setCurrentView('stats')} className={`px-3 sm:px-4 lg:px-6 h-7 rounded text-[10px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'stats' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Статистика
          </button>
          <button onClick={() => setCurrentView('setup')} className={`px-3 sm:px-4 lg:px-6 h-7 rounded text-[10px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'setup' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Настройки
          </button>
          <button onClick={() => setCurrentView('summary')} className={`px-3 sm:px-4 lg:px-6 h-7 rounded text-[10px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentView === 'summary' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Итоги
          </button>
        </nav>

        <div className='hidden sm:block w-full sm:w-24' />
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ: Скроллится ВСЕГДА внутри (и на компьютерах, и на смартфонах) */}
      <main className={`flex-1 p-3 sm:p-6 relative ${currentView === 'board' ? 'overflow-hidden' : 'overflow-y-auto'} bg-slate-950 custom-scrollbar`}>
        {currentView === 'board' && <BoardView />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'setup' && <SetupView />}
        {currentView === 'summary' && <SummaryView />}
      </main>

      {/* НАМЕРТВО ЗАФИКСИРОВАННЫЙ ПОДВАЛ */}
      <footer className='bg-slate-900 border-t border-slate-800 px-4 h-16 flex justify-center items-center gap-4 shrink-0 z-20'>
        <div className='flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center'>
          <button onClick={handlePrevLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap'>
            <span className='inline sm:hidden'>&lt;</span>
            <span className='hidden sm:inline'>Пред. уровень</span>
          </button>

          <button onClick={toggleTimer} className={`font-semibold text-xs tracking-widest uppercase px-6 sm:px-8 h-10 rounded-lg transition active:scale-95 shadow-lg cursor-pointer whitespace-nowrap ${isTimerRunning ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white scale-105 shadow-emerald-950/30'}`}>
            <span className='inline sm:hidden'>{isTimerRunning ? 'Пауза' : 'Старт'}</span>
            <span className='hidden sm:inline'>{isTimerRunning ? 'Пауза' : 'Запустить таймер'}</span>
          </button>

          <button onClick={handleNextLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer'>
            <span className='inline sm:hidden'>&gt;</span>
            <span className='hidden sm:inline'>След. уровень</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
