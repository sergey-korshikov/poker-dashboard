import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function BoardView() {
  const { timeLeft, settings, currentLevelIndex, stats, showCurrency, isTimerRunning, players, displayLevelNumber } = useGame();

  const currentLevel = settings.levels[currentLevelIndex];

  // Ищем следующий ИМЕННО ИГРОВОЙ уровень для корректного отображения блайндов
  const nextLevel = useMemo(() => {
    for (let i = currentLevelIndex + 1; i < settings.levels.length; i++) {
      if (!settings.levels[i].isBreak) return settings.levels[i];
    }
    return null;
  }, [currentLevelIndex, settings.levels]);

  // Вычисляем время до ближайшего перерыва
  const timeToBreak = useMemo(() => {
    let seconds = timeLeft;
    for (let i = currentLevelIndex + 1; i < settings.levels.length; i++) {
      if (settings.levels[i].isBreak) break;
      seconds += settings.levels[i].duration;
    }
    return seconds;
  }, [timeLeft, currentLevelIndex, settings.levels]);

  // Проверяем, доступен ли аддон на текущем уровне турнира
  const isAddonLevelActive = useMemo(() => {
    if (!currentLevel || currentLevel.isBreak) return false;
    return displayLevelNumber === settings.addonLevel && settings.addonCost > 0;
  }, [currentLevel, displayLevelNumber, settings.addonLevel, settings.addonCost]);

  return (
    <div className='w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4'>
      {/* ЛЕВАЯ КОЛОНКА: Статистика турнира */}
      <div className='bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-4 backdrop-blur-md'>
        <div>
          <h3 className='text-sm font-bold uppercase tracking-widest text-slate-500 mb-4'>Статистика турнира</h3>
          <div className='space-y-4'>
            <div className='flex justify-between border-b border-slate-800/60 pb-2'>
              <span className='text-slate-400'>Игроки (в игре/всего)</span>
              <span className='font-mono text-xl font-bold text-slate-200'>
                {stats.playersInGame} <span className='text-slate-700 font-normal'>/</span> {players.length}
              </span>
            </div>
            <div className='flex justify-between border-b border-slate-800/60 pb-2'>
              <span className='text-slate-400'>Всего входов</span>
              <span className='font-mono text-xl font-bold text-amber-500'>{stats.totalEntries}</span>
            </div>
            <div className='flex justify-between border-b border-slate-800/60 pb-2'>
              <span className='text-slate-400'>Средний стек</span>
              <span className='font-mono text-xl font-bold text-sky-400'>{stats.averageStack.toLocaleString()}</span>
            </div>
            <div className='flex justify-between border-b border-slate-800/60 pb-2'>
              <span className='text-slate-400'>Всего фишек</span>
              <span className='font-mono text-xl font-bold text-slate-400'>{stats.totalChips.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {settings?.addonCost > 0 && isAddonLevelActive && (
          <div className='bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-center animate-pulse shadow-lg shadow-cyan-500/5'>
            <span className='text-xs uppercase tracking-wider text-cyan-400 font-black block'>➕ ИДЕТ ПЕРИОД АДДОНОВ!</span>
            <span className='text-xxs text-slate-300 font-mono'>Доступно расширение стеков</span>
          </div>
        )}

        {/* Блок призового фонда */}
        {showCurrency && (
          <div className='bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center'>
            <span className='text-xs uppercase tracking-wider text-amber-500 font-bold block mb-1'>Призовой фонд</span>
            <span className='text-3xl font-black text-amber-400 font-mono'>{stats.totalBank.toLocaleString()} ₽</span>
          </div>
        )}
      </div>

      {/* ЦЕНТРАЛЬНАЯ КОЛОНКА: Главный таймер и блайнды */}
      <div className='lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden'>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r blur-md transition-all ${isTimerRunning ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'}`} />

        <span className='text-xs uppercase tracking-widest text-slate-400 font-black mb-1'>{currentLevel?.isBreak ? '⏸️ Идет перерыв' : `Уровень ${displayLevelNumber}`}</span>

        {/* Текущие блайнды */}
        {!currentLevel?.isBreak ? (
          <h1 className="text-6xl lg:text-7xl font-medium text-white font-mono tracking-wide mb-6">
            {currentLevel?.sb} <span className="text-slate-650 font-light">/</span> {currentLevel?.bb}
            {currentLevel?.ante > 0 && (
              <div className="text-xl text-amber-400/80 font-medium tracking-normal mt-2">Анте: {currentLevel.ante}</div>
            )}
          </h1>
        ) : (
          <h1 className='text-5xl lg:text-6xl font-black text-emerald-400 tracking-tight mb-6'>ПЕРЕРЫВ</h1>
        )}

        {/* ОГРОМНЫЙ ТАЙМЕР С НОВЫМ ШРИФТОМ */}
        <div className="w-full font-mono text-8xl lg:text-9xl font-medium text-slate-100 bg-slate-950/80 py-4 rounded-2xl border border-slate-800 shadow-inner mb-6 tracking-wide leading-none">
          {formatTime(timeLeft)}
        </div>

        {/* Дополнительная инфа под таймером */}
        <div className='w-full grid grid-cols-2 gap-4 text-left border-t border-slate-800 pt-4'>
          <div>
            <span className='text-xxs uppercase tracking-wider text-slate-500 block'>Далее</span>
            {nextLevel ? (
              <span className='font-medium text-slate-300 text-sm font-mono'>
                {nextLevel.sb} / {nextLevel.bb}
              </span>
            ) : (
              <span className='text-sm text-rose-500 font-medium'>Финальный раунд</span>
            )}
          </div>
          <div className='text-right'>
            <span className='text-xxs uppercase tracking-wider text-slate-500 block'>До перерыва</span>
            <span className='font-medium text-slate-300 text-sm font-mono'>{formatTime(timeToBreak)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
