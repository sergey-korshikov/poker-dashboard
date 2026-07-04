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

  return (
    // ИСПРАВЛЕНО: Абсолютное позиционирование во весь экран внутри контейнера main, убираем скролл намертво
    <div className='absolute inset-0 p-4 flex flex-col gap-4 font-sans select-none overflow-hidden bg-slate-950'>
      {/* ЦЕНТРАЛЬНЫЙ РЯД: Занимает ВСЁ свободное пространство (flex-1) */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 items-stretch'>
        {/* БЛОК А: Текущие блайнды (УВЕЛИЧЕН ШРИФТ) */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-xl'>
          <span className='text-sm uppercase tracking-widest text-slate-500 font-bold'>{currentLevel?.isBreak ? 'Статус' : `Уровень ${displayLevelNumber}`}</span>

          <div className='my-auto py-4'>
            {!currentLevel?.isBreak ? (
              <div className='space-y-2'>
                {/* Сделали цифры блайндов значительно крупнее */}
                <div className='font-mono text-6xl xl:text-7xl font-medium tracking-wide text-white leading-none'>{currentLevel?.sb}</div>
                <div className='text-slate-700 text-3xl font-light font-mono leading-none'>/</div>
                <div className='font-mono text-6xl xl:text-7xl font-medium tracking-wide text-amber-400 leading-none'>{currentLevel?.bb}</div>
                {currentLevel?.ante > 0 && <div className='text-base text-slate-300 bg-slate-950 border border-slate-800 px-4 py-1 rounded-xl inline-block mt-4 font-mono font-bold'>Анте: {currentLevel.ante}</div>}
              </div>
            ) : (
              <div className='font-mono text-5xl xl:text-6xl font-medium text-emerald-400 tracking-wider animate-pulse'>ОТДЫХ</div>
            )}
          </div>

          <div className='text-xs uppercase tracking-wider text-slate-500 font-bold font-mono'>Текущие ставки</div>
        </div>

        {/* БЛОК Б: ГИГАНТСКИЙ ГЛАВНЫЙ ТАЙМЕР (МАКСИМАЛЬНЫЙ РАЗМЕР) */}
        <div className='lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl'>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1 bg-gradient-to-r blur-sm transition-all ${isTimerRunning ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'}`} />

          <span className='text-sm uppercase tracking-widest text-slate-400 font-black'>{currentLevel?.isBreak ? '⏸️ Перерыв' : 'Осталось времени'}</span>

          {/* Возвращаем экстремально огромный размер таймера, теперь он не выдавит нижний ряд */}
          <div className='font-mono text-9xl xl:text-[12rem] font-medium text-slate-100 tracking-wide leading-none my-auto selection:bg-transparent'>{formatTime(timeLeft)}</div>

          <div className='flex gap-8 text-sm font-mono text-slate-400 uppercase tracking-wider font-bold'>
            <div>
              До паузы: <span className='text-slate-200 font-black'>{formatTime(timeToBreak)}</span>
            </div>
          </div>
        </div>

        {/* БЛОК В: Следующий уровень */}
        <div className='bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl backdrop-blur-sm'>
          <span className='text-sm uppercase tracking-widest text-slate-500 font-bold'>Далее</span>

          <div className='my-auto py-4'>
            {nextLevel ? (
              <div className='space-y-4 font-mono'>
                <div className='text-slate-400 text-2xl xl:text-3xl font-light'>Блайнды:</div>
                <div className='text-4xl xl:text-5xl font-medium text-slate-300'>
                  {nextLevel.sb} <span className='text-slate-700'>/</span> {nextLevel.bb}
                </div>
                {nextLevel.ante > 0 && <div className='text-sm text-slate-500 font-bold'>Анте: {nextLevel.ante}</div>}
              </div>
            ) : (
              <div className='text-rose-500 font-black uppercase tracking-wider text-base'>Финальный раунд</div>
            )}
          </div>

          <div className='text-xs uppercase tracking-wider text-slate-500 font-bold font-mono'>Следующая структура</div>
        </div>
      </div>
      {/* НИЖНИЙ РЯД: Увеличенная высота h-32 с крупными цифрами */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-32 shrink-0'>
        {/* Модуль 1: Живые игроки */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          <span className='text-xs uppercase tracking-wider text-slate-500 font-bold block'>Игроки в игре</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-4xl xl:text-5xl font-medium text-slate-200 leading-none'>{stats.playersInGame}</span>
            <span className='text-xs text-slate-400 font-mono font-bold'>из {players.length} участников</span>
          </div>
        </div>

        {/* Модуль 2: Всего входов */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          <span className='text-xs uppercase tracking-wider text-slate-500 font-bold block'>Всего входов</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-4xl xl:text-5xl font-medium text-amber-500 leading-none'>{stats.totalEntries}</span>
            <span className='text-xs text-slate-500 font-mono uppercase tracking-widest font-bold'>Buy-In + Rebuy</span>
          </div>
        </div>

        {/* Модуль 3: Средний стек */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md'>
          <span className='text-xs uppercase tracking-wider text-slate-500 font-bold block'>Средний стек</span>
          <div className='flex items-baseline justify-between mt-auto'>
            <span className='font-mono text-3xl xl:text-4xl font-medium text-sky-400 leading-none'>{stats.averageStack.toLocaleString()}</span>
            <span className='text-xs text-slate-400 font-mono font-bold'>фишек у игрока</span>
          </div>
        </div>

        {/* Модуль 4: Призовой фонд */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden'>
          <span className='text-xs uppercase tracking-wider text-slate-500 font-bold block'>Призовой фонд</span>

          {showCurrency ? (
            <div className='flex items-baseline justify-between mt-auto'>
              <span className='font-mono text-3xl xl:text-4xl font-medium text-emerald-400 leading-none'>{stats.totalBank.toLocaleString()}</span>
              <span className='text-sm font-bold text-emerald-500 font-mono'>₽</span>
            </div>
          ) : (
            <div className='text-xs text-slate-500 italic mt-auto font-mono uppercase tracking-wider font-bold'>Скрыт настройками</div>
          )}

          {showCurrency && <div className='absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl' />}
        </div>
      </div>
    </div>
  );
}
