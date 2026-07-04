import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function BoardView() {
  const { timeLeft, settings, currentLevelIndex, stats, showCurrency, players, displayLevelNumber } = useGame();

  const currentLevel = settings.levels[currentLevelIndex];

  const nextLevel = useMemo(() => {
    for (let i = currentLevelIndex + 1; i < settings.levels.length; i++) {
      if (!settings.levels[i].isBreak) return settings.levels[i];
    }
    return null;
  }, [currentLevelIndex, settings.levels]);

  const timeToBreak = useMemo(() => {
    let seconds = timeLeft;
    for (let i = currentLevelIndex + 1; i < settings.levels.length; i++) {
      if (settings.levels[i].isBreak) break;
      seconds += settings.levels[i].duration;
    }
    return seconds;
  }, [timeLeft, currentLevelIndex, settings.levels]);

  const isAddonLevelActive = useMemo(() => {
    if (!currentLevel || currentLevel.isBreak) return false;
    return displayLevelNumber === settings.addonLevel && settings.addonCost > 0;
  }, [currentLevel, displayLevelNumber, settings.addonLevel, settings.addonCost]);

  return (
    <div className='absolute inset-0 p-4 flex flex-col gap-4 font-sans select-none overflow-hidden bg-slate-950'>
      {/* ЦЕНТРАЛЬНЫЙ РЯД СТРУКТУРЫ */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 items-stretch'>
        {/* БЛОК А: Текущие блайнды */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl'>
          {/* ДОБАВЛЕН КАПС: Для мелкого служебного текста */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>{currentLevel?.isBreak ? 'Статус турнира' : `Игровой раунд ${displayLevelNumber}`}</span>

          <div className='my-auto py-4'>
            {!currentLevel?.isBreak ? (
              <div className='space-y-2'>
                <div className='font-mono text-6xl xl:text-7xl font-bold tracking-wide text-white leading-none'>{currentLevel?.sb}</div>
                <div className='text-slate-700 text-3xl font-light font-mono leading-none'>/</div>
                <div className='font-mono text-6xl xl:text-7xl font-bold tracking-wide text-amber-400 leading-none'>{currentLevel?.bb}</div>
                {currentLevel?.ante > 0 && <div className='text-base text-slate-300 bg-slate-950 border border-slate-800 px-4 py-1 rounded-xl inline-block mt-4 font-mono font-medium uppercase tracking-wide'>Анте: {currentLevel.ante}</div>}
              </div>
            ) : (
              <div className='font-mono text-5xl xl:text-6xl font-medium text-emerald-400 tracking-wider'>Перерыв</div>
            )}
          </div>

          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Текущие ставки</span>
        </div>

        {/* БЛОК Б: ОГРОМНЫЙ ГЛАВНЫЙ ТАЙМЕР */}
        <div className='lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-2xl relative'>
          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>{currentLevel?.isBreak ? 'Идет перерыв' : 'Осталось времени'}</span>

          <div className='font-mono text-9xl xl:text-[12rem] font-bold text-white tracking-wide leading-none my-auto'>{formatTime(timeLeft)}</div>

          <div className='text-sm font-mono text-slate-400 font-medium uppercase tracking-wide'>
            {isAddonLevelActive ? (
              <span className='text-cyan-400 font-medium tracking-wide'>Период аддонов открыт</span>
            ) : (
              <div>
                До перерыва осталось: <span className='text-amber-400 font-mono font-medium ml-1 normal-case font-sans font-bold'>{formatTime(timeToBreak)}</span>
              </div>
            )}
          </div>
        </div>

        {/* БЛОК В: Следующий уровень */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl'>
          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Следующий раунд</span>

          <div className='my-auto py-4'>
            {nextLevel ? (
              <div className='space-y-3 font-mono'>
                {/* Добавлен мелкий капс подписи */}
                <div className='text-slate-500 text-xs font-medium uppercase tracking-wider font-sans'>Будущие ставки:</div>
                <div className='text-4xl xl:text-5xl font-bold text-slate-300'>
                  {nextLevel.sb} <span className='text-slate-700'>/</span> {nextLevel.bb}
                </div>
                {nextLevel.ante > 0 && <div className='text-sm text-slate-400 font-medium bg-slate-950 px-3 py-1 rounded-lg inline-block border border-slate-850 uppercase tracking-wide'>Анте: {nextLevel.ante}</div>}
              </div>
            ) : (
              <div className='text-slate-500 font-medium text-base'>Финальный раунд</div>
            )}
          </div>

          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Следующая структура</span>
        </div>
      </div>

      {/* НИЖНИЙ РЯД ДЕТАЛЬНОЙ СТАТИСТИКИ */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 h-32 shrink-0 ${showCurrency ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {/* Блок 1: Живые участники */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          {/* ДОБАВЛЕН КАПС: Идентичный мелкий стиль во всех нижних блоках */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400 block'>В игре участников</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-4xl xl:text-5xl font-bold text-sky-400 leading-none'>{stats.playersInGame}</span>
            <span className='text-xs text-slate-500 font-mono font-medium uppercase tracking-wider'>из {players.length} всего</span>
          </div>
        </div>

        {/* Блок 2: Всего входов */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400 block'>Всего входов</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-4xl xl:text-5xl font-bold text-white leading-none'>{stats.totalEntries}</span>
            <span className='text-xs text-slate-500 font-mono font-medium uppercase tracking-wider'>входы и ребаи</span>
          </div>
        </div>

        {/* Блок 3: Средний стек */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          {/* ДОБАВЛЕН КАПС */}
          <span className='text-xs font-semibold uppercase tracking-wider text-slate-400 block'>Средний стек фишек</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-3xl xl:text-4xl font-bold text-white leading-none'>{stats.averageStack.toLocaleString()}</span>
            <span className='text-xs text-slate-500 font-mono font-medium uppercase tracking-wider'>у каждого игрока</span>
          </div>
        </div>

        {/* Блок 4: Призовой фонд */}
        {showCurrency && (
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
            {/* ДОБАВЛЕН КАПС */}
            <span className='text-xs font-semibold uppercase tracking-wider text-slate-400 block'>Общий призовой фонд</span>
            <div className='flex items-baseline justify-between mt-auto'>
              <span className='font-mono text-3xl xl:text-4xl font-bold text-emerald-400 leading-none'>{stats.totalBank.toLocaleString()}</span>
              <span className='text-sm font-medium text-emerald-500 font-mono'>₽</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
