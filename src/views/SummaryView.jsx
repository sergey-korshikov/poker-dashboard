import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export function SummaryView() {
  const { events, players, showCurrency, settings, resetGame } = useGame();

  const tournamentResults = useMemo(() => {
    let totalBank = 0;
    events.forEach(e => {
      if (['BUY_IN', 'REBUY', 'ADDON'].includes(e.type)) totalBank += e.cost;
    });

    const livePlayers = players.filter(name => {
      const pEvents = events.filter(e => e.playerName === name);
      if (pEvents.length === 0) return false;
      return pEvents[pEvents.length - 1].type !== 'PLAYER_OUT';
    });

    const isTournamentFinished = players.length > 1 && livePlayers.length === 1;
    const winnerName = isTournamentFinished ? livePlayers : null;

    const leaderboard = players.map(name => {
      const playerEvents = events.filter(e => e.playerName === name);
      const rebuysCount = playerEvents.filter(e => e.type === 'REBUY').length;
      const rebuysSum = playerEvents.filter(e => e.type === 'REBUY').reduce((sum, e) => sum + e.cost, 0);
      const hasAddon = playerEvents.some(e => e.type === 'ADDON');
      const lastEvent = playerEvents[playerEvents.length - 1];
      const isCurrentlyOut = lastEvent ? lastEvent.type === 'PLAYER_OUT' : false;

      let place = 1;
      if (isCurrentlyOut) {
        place = lastEvent.place;
      } else if (isTournamentFinished && name !== winnerName) {
        place = 2;
      }

      return {
        name,
        place,
        isCurrentlyOut,
        rebuysCount,
        hasAddon,
        totalInvested: settings.buyInCost + rebuysSum + (hasAddon ? settings.addonCost : 0),
        isWinner: name === winnerName,
      };
    });

    leaderboard.sort((a, b) => {
      if (a.isCurrentlyOut !== b.isCurrentlyOut) return a.isCurrentlyOut ? 1 : -1;
      return a.place - b.place;
    });

    return { totalBank, leaderboard, isTournamentFinished, winnerName };
  }, [events, players, settings]);

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6 p-2 sm:p-4'>
      {/* КАРТОЧКА ГЛАВНЫХ ИТОГОВ */}
      <div className={`border p-6 sm:p-8 rounded-xl shadow-md text-center transition-all duration-300 ${tournamentResults.isTournamentFinished ? 'bg-amber-950/20 border-amber-800/60' : 'bg-slate-900 border border-slate-800'}`}>
        <h3 className={`text-xs uppercase tracking-wider font-medium mb-1 ${tournamentResults.isTournamentFinished ? 'text-amber-400' : 'text-slate-500'}`}>{tournamentResults.isTournamentFinished ? 'Турнир завершен' : 'Протокол турнира'}</h3>
        <h1 className={`text-xl sm:text-2xl font-bold tracking-wide mb-4 ${tournamentResults.isTournamentFinished ? 'text-amber-300' : 'text-white'}`}>{tournamentResults.isTournamentFinished ? 'Результаты финального стола' : 'Текущее положение участников'}</h1>

        {showCurrency && (
          <div className='inline-block bg-slate-950 border border-slate-800 px-5 sm:px-6 py-2 rounded-lg font-mono'>
            <span className='text-slate-500 text-xxs uppercase tracking-wider block font-medium mb-0.5'>Общий призовой фонд</span>
            <span className='text-xl sm:text-2xl font-bold text-white'>{tournamentResults.totalBank.toLocaleString()} ₽</span>
          </div>
        )}
      </div>

      {/* ТАБЛИЦА ПРОТОКОЛА */}
      <div className='bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md'>
        <div className='px-4 sm:px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center text-xs uppercase tracking-wider text-slate-500 font-medium'>
          <span>Позиция и участник</span>
          <span className='hidden md:inline'>Финансовая активность</span>
        </div>

        <div className='divide-y divide-slate-800/40'>
          {tournamentResults.leaderboard.map(player => {
            return (
              <div
                key={player.name}
                /* ИСПРАВЛЕНО: На средних экранах (до md:) блок переходит в flex-col, предотвращая зарезание текста */
                className={`px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 transition-all duration-150 ${player.isWinner ? 'bg-emerald-950/20 border-y border-emerald-800/60 font-medium' : player.isCurrentlyOut ? 'bg-slate-950/10 opacity-40' : 'hover:bg-slate-950/10'}`}
              >
                <div className='flex items-center gap-4 sm:gap-6'>
                  <span className={`w-20 sm:w-24 font-mono font-medium text-xs px-2 py-1 rounded text-center tracking-wide shrink-0 ${player.isWinner ? 'bg-emerald-500 text-black font-bold' : player.isCurrentlyOut ? 'bg-slate-950 text-slate-500 border border-slate-850' : 'bg-sky-950 text-sky-400 border border-sky-900/40'}`}>{player.isWinner ? 'Победитель' : player.isCurrentlyOut ? `Вылет #${player.place}` : 'В игре'}</span>

                  <div>
                    <h4 className={`text-sm sm:text-base font-medium tracking-tight ${player.isWinner ? 'text-white text-base sm:text-lg font-bold' : player.isCurrentlyOut ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{player.name}</h4>

                    {/* ИСПРАВЛЕНО: Показываем активность снизу на смартфонах и ПЛАНШЕТАХ (скрываем только от md:) */}
                    <div className='md:hidden text-[11px] text-slate-500 font-mono mt-1 space-y-0.5'>
                      <div>
                        Ребаи: {player.rebuysCount > 0 ? `${player.rebuysCount}` : '0'}
                        {player.hasAddon ? ' + аддон' : ''}
                      </div>
                      {showCurrency && <div className='text-slate-400 font-medium'>Внесено: {player.totalInvested.toLocaleString()} ₽</div>}
                    </div>
                  </div>
                </div>

                {/* Правая сторона: Видна только на больших экранах (от md:) */}
                <div className='hidden md:flex items-center gap-6 text-xs font-mono text-slate-400'>
                  <div className='text-right'>
                    <span className='text-xxs text-slate-600 block uppercase font-sans font-medium'>Активность:</span>
                    <span className={player.isWinner ? 'text-slate-200' : 'text-slate-400'}>
                      {player.rebuysCount > 0 ? `${player.rebuysCount} ребаев` : '0 ребаев'}
                      {player.hasAddon && ' + аддон'}
                    </span>
                  </div>

                  {showCurrency && (
                    <div className='text-right border-l border-slate-800 pl-4 w-28'>
                      <span className='text-xxs text-slate-600 block uppercase font-sans font-medium'>Внесено:</span>
                      <span className={`font-medium text-sm ${player.isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>{player.totalInvested.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='text-center pt-2 pb-6'>
        <button onClick={resetGame} className='w-full sm:w-auto bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white px-5 py-2 rounded-lg text-xxs font-medium uppercase tracking-wider transition duration-150 cursor-pointer'>
          Очистить лог и начать новый турнир
        </button>
      </div>
    </div>
  );
}
