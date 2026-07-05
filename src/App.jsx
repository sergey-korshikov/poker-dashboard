import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import { BoardView } from './views/BoardView';
import { StatsView } from './views/StatsView';
import { SetupView } from './views/SetupView';
import { SummaryView } from './views/SummaryView';

export default function App() {
  const [currentPage, setCurrentPage] = useState('board');
  const { isTimerRunning, toggleTimer, handleNextLevel, handlePrevLevel, showCurrency, setShowCurrency, stats, players } = useGame();

  useEffect(() => {
    if (players.length > 1 && stats.playersInGame === 1) {
      setCurrentPage('summary');
    }
  }, [stats.playersInGame, players.length]);

  return (
    // min-h-screen позволяет сайту на iOS естественно занимать всю высоту без багов с нижней панелью Safari
    <div className='min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased overflow-x-hidden'>
      {/* ЕДИНАЯ СТРОГАЯ ШАПКА ДЛЯ УПРАВЛЕНИЯ И НАВИГАЦИИ */}
      <header className='bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 z-20 sticky top-0'>
        {/* ЛЕВАЯ ЧАСТЬ: Иконка валюты и Мобильный пульт таймера */}
        <div className='flex items-center justify-between lg:justify-start gap-4 w-full lg:w-auto'>
          <button onClick={() => setShowCurrency(!showCurrency)} className='bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white text-base w-12 h-9 rounded-lg transition flex items-center justify-center cursor-pointer shrink-0' title={showCurrency ? 'Скрыть валюту' : 'Показать валюту'}>
            {showCurrency ? '👁️' : '🙈'}
          </button>

          {/* ИСПРАВЛЕНО: Кнопки таймера теперь встроены в шапку и видны на смартфонах сразу сверху */}
          <div className='flex items-center gap-1.5 sm:gap-2'>
            <button onClick={handlePrevLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-sm sm:text-xs px-3 sm:px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap' title='Предыдущий уровень'>
              <span className='inline sm:hidden'>&lt;</span>
              <span className='hidden sm:inline'>Пред. уровень</span>
            </button>

            <button onClick={toggleTimer} className={`font-semibold text-xs tracking-widest uppercase px-4 sm:px-6 h-9 rounded-lg transition active:scale-95 shadow-lg cursor-pointer whitespace-nowrap ${isTimerRunning ? 'bg-slate-950 hover:bg-slate-900 text-rose-400 border border-rose-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/30'}`}>
              {isTimerRunning ? 'Пауза' : 'Старт'}
            </button>

            <button onClick={handleNextLevel} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-sm sm:text-xs px-3 sm:px-4 h-9 rounded-lg transition active:scale-95 cursor-pointer' title='Следующий уровень'>
              <span className='inline sm:hidden'>&gt;</span>
              <span className='hidden sm:inline'>След. уровень</span>
            </button>
          </div>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Пульт переключения экранов */}
        <nav className='flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850 h-10 w-full lg:w-auto justify-between lg:justify-start'>
          <button onClick={() => setCurrentPage('board')} className={`flex-1 lg:flex-none px-4 lg:px-6 h-8 rounded text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentPage === 'board' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Табло
          </button>
          <button onClick={() => setCurrentPage('stats')} className={`flex-1 lg:flex-none px-4 lg:px-6 h-8 rounded text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentPage === 'stats' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Статистика
          </button>
          <button onClick={() => setCurrentPage('setup')} className={`flex-1 lg:flex-none px-4 lg:px-6 h-8 rounded text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentPage === 'setup' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Настройки
          </button>
          <button onClick={() => setCurrentPage('summary')} className={`flex-1 lg:flex-none px-4 lg:px-6 h-8 rounded text-[11px] sm:text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${currentPage === 'summary' ? 'bg-white text-black font-semibold' : 'text-slate-400 hover:text-slate-200'}`}>
            Итоги
          </button>
        </nav>

        {/* ПРАВАЯ ЧАСТЬ: Чистый скрытый блок для идеального флекс-выравнивания на десктопе */}
        <div className='hidden lg:block w-24' />
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ: Естественный скролл всей страницы, подвал больше ничего не зажимает */}
      <main className='flex-1 p-3 sm:p-6 bg-slate-950'>
        {currentPage === 'board' && <BoardView />}
        {currentPage === 'stats' && <StatsView />}
        {currentPage === 'setup' && <SetupView />}
        {currentPage === 'summary' && <SummaryView />}
      </main>
    </div>
  );
}
