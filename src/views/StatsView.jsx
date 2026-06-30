import React from 'react';
import { useGame } from '../context/GameContext';

export function StatsView() {
  const { players, events, showCurrency, currentLevelIndex, settings, displayLevelNumber, playerRebuy, playerOut, playerAddon, calculateNextRebuy, undoLastEvent } = useGame();

  // Проверяем, доступен ли аддон на текущем ИГРОВОМ уровне
  const isAddonLevelActive = displayLevelNumber === settings.addonLevel;

  // Функция расчета персональной статистики с учетом цепочки Re-entry
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
      if (e.type === 'ADDON') {
        hasAddon = true;
      }
    });

    // ИСПРАВЛЕНО: статус игрока зависит строго от его ПОСЛЕДНЕГО события в истории
    const lastEvent = playerEvents[playerEvents.length - 1];
    const isOut = lastEvent ? lastEvent.type === 'PLAYER_OUT' : false;
    const outPlace = isOut ? lastEvent.place : null;

    const rebuysCount = playerEvents.filter(e => e.type === 'REBUY').length;

    return {
      totalSpent,
      totalChips,
      isOut,
      outPlace,
      hasAddon,
      rebuysCount,
    };
  };

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6 p-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-xl font-black text-slate-100 uppercase tracking-wider'>Управление игроками и статистика</h3>
        {events.length > 0 && (
          <button onClick={undoLastEvent} className='bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-400 text-xs px-3 py-1.5 rounded-xl transition'>
            ↩️ Отменить последнее действие
          </button>
        )}
      </div>

      {players.length === 0 ? (
        <div className='text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500'>Игроки еще не добавлены. Перейдите во вкладку ⚙️ Настройки.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {players.map(name => {
            const p = getPlayerStats(name);
            const nextRebuy = calculateNextRebuy(name);

            return (
              <div key={name} className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${p.isOut ? 'bg-rose-950/10 border-rose-900/30 text-slate-400' : 'bg-slate-900 border-slate-800 text-white shadow-xl hover:border-slate-700'}`}>
                {/* Шапка карточки */}
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h4 className={`text-lg font-bold tracking-tight ${p.isOut ? 'text-rose-400/80' : 'text-slate-100'}`}>
                      {name} {p.isOut && '💀'}
                    </h4>
                    <span className='text-xxs uppercase tracking-wider font-mono text-slate-500'>{p.isOut ? `Выбыл на ${p.outPlace} месте` : 'В игре'}</span>
                  </div>

                  {showCurrency && (
                    <div className='text-right font-mono'>
                      <span className={`text-sm font-bold ${p.isOut ? 'text-rose-400/60' : 'text-amber-400'}`}>{p.totalSpent} ₽</span>
                    </div>
                  )}
                </div>

                {/* Статистика фишек */}
                <div className='grid grid-cols-2 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-850/60 text-xs font-mono mb-4'>
                  <div>
                    <span className='text-slate-500 block text-xxs uppercase'>Всего фишек:</span>
                    <span className={`font-bold ${p.isOut ? 'text-rose-400/60' : 'text-sky-400'}`}>{p.totalChips.toLocaleString()}</span>
                  </div>
                  <div className='text-right'>
                    <span className='text-slate-500 block text-xxs uppercase'>Ребаи:</span>
                    <span className='font-bold text-slate-300'>{p.rebuysCount}</span>
                  </div>
                </div>

                {/* Интерактивные кнопки действий */}
                <div className='space-y-2 mt-auto'>
                  <div className='grid grid-cols-2 gap-2'>
                    {/* Кнопка РЕБАЯ доступна ВСЕГДА (включая Re-entry после вылета) */}
                    <button onClick={() => playerRebuy(name)} className={`w-full text-xs py-2 rounded-xl font-bold transition ${p.isOut ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}>
                      {p.isOut ? '🔄 Повторный вход' : `🔄 Ребай (${showCurrency ? `${nextRebuy.cost}₽` : '+ стек'})`}
                    </button>

                    {/* Кнопка АДДОНА: полностью скрывается, если аддон равен 0 */}
                    {settings.addonCost > 0 && (
                      <button onClick={() => playerAddon(name)} disabled={p.hasAddon || !isAddonLevelActive} className={`w-full text-xs py-2 rounded-xl font-bold transition ${p.hasAddon ? 'bg-slate-950 text-slate-700 border border-slate-900 cursor-not-allowed' : isAddonLevelActive ? 'bg-emerald-600 hover:bg-emerald-500 text-black font-black' : 'bg-slate-850 text-slate-600 border border-slate-800/40 cursor-not-allowed'}`} title={!isAddonLevelActive ? `Аддон доступен только на уровне ${settings.addonLevel}` : ''}>
                        {p.hasAddon ? '✅ Аддон есть' : `➕ Аддон (${settings.addonCost}₽)`}
                      </button>
                    )}
                  </div>

                  {/* Кнопка АУТА активна только если игрок еще за столом */}
                  {!p.isOut && (
                    <button onClick={() => playerOut(name)} className='w-full bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 text-xs py-2 rounded-xl font-bold transition'>
                      🚪 Игрок выбыл (Аут)
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
