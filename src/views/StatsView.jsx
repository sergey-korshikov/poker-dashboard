import React from 'react';
import { useGame } from '../context/GameContext';

export function StatsView() {
  const { players, events, showCurrency, currentLevelIndex, settings, displayLevelNumber, playerRebuy, playerOut, playerAddon, calculateNextRebuy, undoLastEvent } = useGame();

  const isAddonLevelActive = displayLevelNumber === settings.addonLevel;

  const getPlayerStats = playerName => {
    const playerEvents = events.filter(e => e.playerName === playerName);

    let totalSpent = 0;
    let totalChips = 0;
    let hasAddon = false;

    playerEvents.forEach(e => {
      if (['BUY_IN', 'REBUY', 'ADDON'].includes(e.type)) {
        totalSpent += e.cost;
        totalChips += e.stack;
      }
      if (e.type === 'ADDON') hasAddon = true;
    });

    const lastEvent = playerEvents[playerEvents.length - 1];
    const isOut = lastEvent ? lastEvent.type === 'PLAYER_OUT' : false;
    const outPlace = isOut ? lastEvent.place : null;
    const rebuysCount = playerEvents.filter(e => e.type === 'REBUY').length;

    return { totalSpent, totalChips, isOut, outPlace, hasAddon, rebuysCount };
  };

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      {/* ШАПКА ДИЛЕРА (УБРАН КАПС С ЗАГОЛОВКА) */}
      <div className='flex flex-wrap justify-between items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md'>
        <div>
          <h3 className='text-xl font-bold text-white tracking-wider'>Статистика и управление</h3>
          {settings.addonCost > 0 && (
            <p className='text-xs text-slate-400 mt-1 font-mono'>
              Аддон: уровень {settings.addonLevel} • Текущий уровень: {displayLevelNumber}
            </p>
          )}
        </div>

        {events.length > 0 && (
          <button onClick={undoLastEvent} className='bg-white hover:bg-slate-200 text-black text-xs font-medium px-5 h-9 rounded-lg transition duration-150 cursor-pointer'>
            Отменить действие
          </button>
        )}
      </div>

      {/* СЕТКА КАРТОЧЕК */}
      {players.length === 0 ? (
        <div className='text-center py-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-500'>Список игроков пуст. Добавьте участников во вкладке настроек.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6'>
          {players.map(name => {
            const p = getPlayerStats(name);
            const nextRebuy = calculateNextRebuy(name);

            return (
              <div key={name} className={`border rounded-xl p-5 flex flex-col justify-between transition-all duration-150 ${p.isOut ? 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60' : 'bg-slate-900 border border-slate-800 text-white shadow-md'}`}>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h4 className={`text-lg font-bold tracking-tight ${p.isOut ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{name}</h4>
                    {/* Убран капс со статуса вылета */}
                    <span className='text-xxs font-mono text-slate-500 font-medium mt-0.5 inline-block'>{p.isOut ? `Выбыл (${p.outPlace} место)` : 'В игре'}</span>
                  </div>

                  {showCurrency && (
                    <div className='text-right font-mono'>
                      <span className={`text-sm font-bold ${p.isOut ? 'text-slate-500' : 'text-white'}`}>{p.totalSpent.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-lg border border-slate-850/60 text-xs font-mono mb-4'>
                  <div>
                    <span className='text-slate-500 block text-xxs uppercase tracking-wider font-sans font-bold'>Фишки:</span>
                    <span className={p.isOut ? 'text-slate-500' : 'text-slate-200'}>{p.totalChips.toLocaleString()}</span>
                  </div>
                  <div className='text-right'>
                    <span className='text-slate-500 block text-xxs uppercase tracking-wider font-sans font-bold'>Ребаи:</span>
                    <span className={p.isOut ? 'text-slate-500' : 'text-slate-200'}>{p.rebuysCount}</span>
                  </div>
                </div>

                {/* УБРАН КАПС С ТЕКСТА КНОПОК */}
                <div className='space-y-2 mt-auto'>
                  <div className='grid grid-cols-2 gap-2'>
                    <button onClick={() => playerRebuy(name)} className={`w-full text-xs h-9 rounded-lg font-medium transition duration-150 cursor-pointer ${p.isOut ? 'bg-white hover:bg-slate-200 text-black shadow-md font-bold' : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700'}`}>
                      {p.isOut ? 'Повторный вход' : `Ребай (${showCurrency ? `${nextRebuy.cost}₽` : '+стек'})`}
                    </button>

                    {settings.addonCost > 0 && (
                      <button onClick={() => playerAddon(name)} disabled={p.hasAddon || !isAddonLevelActive} className={`w-full text-xs h-9 rounded-lg font-medium transition ${p.hasAddon ? 'bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed' : isAddonLevelActive ? 'bg-slate-850 hover:bg-slate-800 text-slate-100 border border-slate-700 cursor-pointer' : 'bg-slate-850 text-slate-600 border border-slate-800/40 cursor-not-allowed'}`}>
                        {p.hasAddon ? 'Есть аддон' : `Аддон (${settings.addonCost}₽)`}
                      </button>
                    )}
                  </div>

                  {!p.isOut && (
                    <button onClick={() => playerOut(name)} className='w-full bg-slate-950 hover:bg-slate-900 text-rose-400 border border-rose-950 text-xs h-9 rounded-lg font-medium transition duration-150 cursor-pointer'>
                      Игрок выбыл
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
