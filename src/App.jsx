import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { BoardView } from './views/BoardView';
import { SetupView } from './views/SetupView';
import { StatsView } from './views/StatsView';
import { SummaryView } from './views/SummaryView';

export function App() {
  const { isTimerRunning, toggleTimer, handleNextLevel, handlePrevLevel, addTimeToCurrentRound, showCurrency, setShowCurrency, undoLastEvent } = useGame();
  const { stats, players: allPlayers } = useGame();

  React.useEffect(() => {
    // Турнир завершен, если игроков больше одного, а в игре остался ровно 1
    if (allPlayers.length > 1 && stats.playersInGame === 1) {
      setCurrentView('summary');
    }
  }, [stats.playersInGame, allPlayers.length]);

  // Состояние текущего активного экрана
  const [currentView, setCurrentView] = useState('board'); // 'board' | 'stats' | 'setup'

  return (
    <div className='min-h-screen bg-slate-950 text-white font-sans antialiased flex flex-col'>
      {/* ШАПКА ПРИЛОЖЕНИЯ И НАВИГАЦИЯ */}
      <header className='bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-50'>
        <div className='flex items-center gap-2'>
          <span className='text-xl'>🃏</span>
          <h1 className='text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'>HomePoker Board</h1>
        </div>

        {/* Кнопки переключения экранов */}
        <nav className='flex bg-slate-950 p-1 rounded-xl border border-slate-800'>
          <button onClick={() => setCurrentView('board')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currentView === 'board' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            📺 Табло
          </button>
          <button onClick={() => setCurrentView('stats')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currentView === 'stats' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            📊 Статистика
          </button>
          <button
            onClick={() => setCurrentView('summary')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currentView === 'summary' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🏆 Итоги
          </button>
          <button onClick={() => setCurrentView('setup')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${currentView === 'setup' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
            ⚙️ Настройки
          </button>
        </nav>

        {/* Быстрые утилиты управления в шапке */}
        <div className='flex items-center gap-2'>
          <button onClick={() => setShowCurrency(!showCurrency)} className={`p-2 rounded-lg border text-sm transition ${showCurrency ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-rose-950/40 border-rose-900/50 text-rose-400'}`} title='Скрыть/Показать цены в рублях'>
            {showCurrency ? '👁️ Рубли' : '🙈 Валюта скрыта'}
          </button>
          <button onClick={undoLastEvent} className='p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm hover:bg-slate-750 transition' title='Отменить последнее действие'>
            ↩️ Отмена действия
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ ЭКРАНОВ */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center relative"> {/* <-- Добавлен класс relative */}
        {currentView === 'board' && <BoardView />}
        {currentView === 'stats' && <StatsView />}
        {currentView === 'setup' && <SetupView />}
        {currentView === 'summary' && <SummaryView />}
      </main>

      {/* НИЖНИЙ ПУЛЬТ УПРАВЛЕНИЯ ТАЙМЕРОМ */}
      <footer className='bg-slate-900 border-t border-slate-800 p-4 sticky bottom-0 z-50 backdrop-blur-md flex items-center justify-center gap-4'>
        <button onClick={handlePrevLevel} className='bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm px-4 py-2 rounded-xl transition active:scale-95'>
          ⏮️ Назад
        </button>

        <button onClick={toggleTimer} className={`px-8 py-2 rounded-xl font-bold text-sm shadow transition active:scale-95 text-black ${isTimerRunning ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-400 hover:bg-emerald-300'}`}>
          {isTimerRunning ? '⏸️ ПАУЗА' : '▶️ ЗАПУСТИТЬ ТАЙМЕР'}
        </button>

        <button onClick={handleNextLevel} className='bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm px-4 py-2 rounded-xl transition active:scale-95'>
          Вперед ⏭️
        </button>

        <div className='h-6 w-px bg-slate-800 mx-2' />

        <button onClick={() => addTimeToCurrentRound(1)} className='bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition'>
          +1 мин
        </button>
        <button onClick={() => addTimeToCurrentRound(5)} className='bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition'>
          +5 мин
        </button>
      </footer>
    </div>
  );
}

export default App;
