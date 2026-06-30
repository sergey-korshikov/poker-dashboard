import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

export function SummaryView() {
  const { events, players, showCurrency, settings, resetGame } = useGame();

  const tournamentResults = useMemo(() => {
    // 1. Подсчет общего банка
    let totalBank = 0;
    events.forEach(e => {
      if (['BUY_IN', 'REBUY', 'ADDON'].includes(e.type)) totalBank += e.cost;
    });

    // 2. Определяем, кто ЖИВ за столом прямо сейчас
    // (Игрок жив, если его ПОСЛЕДНЕЕ событие — НЕ аут)
    const livePlayers = players.filter(name => {
      const pEvents = events.filter(e => e.playerName === name);
      if (pEvents.length === 0) return false;
      return pEvents[pEvents.length - 1].type !== 'PLAYER_OUT';
    });

    // Турнир завершен, только если за столом остался ОДИН человек, а всего игроков было больше одного
    const isTournamentFinished = players.length > 1 && livePlayers.length === 1;
    const winnerName = isTournamentFinished ? livePlayers[0] : null;

    // 3. Формируем протокол игроков
    const leaderboard = players.map(name => {
      const playerEvents = events.filter(e => e.playerName === name);

      const rebuysCount = playerEvents.filter(e => e.type === 'REBUY').length;
      const rebuysSum = playerEvents.filter(e => e.type === 'REBUY').reduce((sum, e) => sum + e.cost, 0);
      const hasAddon = playerEvents.some(e => e.type === 'ADDON');

      const lastEvent = playerEvents[playerEvents.length - 1];
      const isCurrentlyOut = lastEvent ? lastEvent.type === 'PLAYER_OUT' : false;

      // Определение места:
      let place = 1;
      if (isCurrentlyOut) {
        place = lastEvent.place; // Берем сохраненное место вылета
      } else if (isTournamentFinished && name !== winnerName) {
        place = 2; // Если игра завершена принудительно, все живые кроме победителя делят условные места
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

    // Сортировка: сначала те, кто В ИГРЕ, затем выбывшие (по занятому месту от 2-го к последнему)
    leaderboard.sort((a, b) => {
      if (a.isCurrentlyOut !== b.isCurrentlyOut) {
        return a.isCurrentlyOut ? 1 : -1; // Живые всегда выше выбывших
      }
      return a.place - b.place; // Выбывшие сортируются по местам (2, 3, 4...)
    });

    return {
      totalBank,
      leaderboard,
      isTournamentFinished,
      winnerName,
    };
  }, [events, players, settings]);

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6 p-4'>
      {/* ДИНАМИЧЕСКИЙ ЗАГЛОВОК: Итоги или Текущая Статистика */}
      <div className={`bg-gradient-to-br border p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden transition-all ${tournamentResults.isTournamentFinished ? 'from-amber-950/20 to-slate-950 border-amber-500/30' : 'from-slate-900 to-slate-950 border-slate-800'}`}>
        {tournamentResults.isTournamentFinished ? (
          <>
            <div className='absolute -top-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl' />
            <h3 className='text-xs uppercase tracking-widest text-amber-500 font-black mb-2'>🏆 Турнир Завершен</h3>
            <h1 className='text-3xl font-black text-white tracking-tight mb-4'>Поздравляем Победителя!</h1>
          </>
        ) : (
          <>
            <div className='absolute -top-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl' />
            <h3 className='text-xs uppercase tracking-widest text-sky-400 font-black mb-2'>📊 Живой мониторинг</h3>
            <h1 className='text-3xl font-black text-white tracking-tight mb-4'>Текущее состояние игры</h1>
          </>
        )}

        {showCurrency && (
          <div className='inline-block bg-slate-950/60 border border-slate-850 px-6 py-3 rounded-2xl font-mono shadow-inner'>
            <span className='text-slate-500 text-xxs uppercase block'>Текущий призовой фонд</span>
            <span className='text-3xl font-black text-amber-400'>{tournamentResults.totalBank.toLocaleString()} ₽</span>
          </div>
        )}
      </div>

      {/* ТАБЛИЦА ПРОТОКОЛА */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl'>
        <div className='px-6 py-4 bg-slate-950/30 border-b border-slate-800 flex justify-between items-center'>
          <span className='text-sm font-bold text-slate-400 uppercase tracking-wider'>{tournamentResults.isTournamentFinished ? 'Финальный протокол' : 'Положение игроков'}</span>
          <span className='text-xs text-slate-500'>Всего входов: {players.length}</span>
        </div>

        <div className='divide-y divide-slate-800/60'>
          {tournamentResults.leaderboard.map(player => {
            // Определяем значки статуса и места
            let badge = '';
            if (tournamentResults.isTournamentFinished && player.place === 1) {
              badge = '🥇';
            } else if (player.isCurrentlyOut) {
              badge = `💀 #${player.place}`;
            } else {
              badge = '🟢'; // Игрок за столом в текущий момент
            }

            return (
              <div key={player.name} className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-all ${player.isWinner ? 'bg-amber-500/5' : player.isCurrentlyOut ? 'bg-slate-950/20 opacity-50' : 'hover:bg-slate-950/10'}`}>
                {/* Имя и Статус */}
                <div className='flex items-center gap-4'>
                  <span className='w-14 text-center font-mono font-black text-slate-400 text-sm'>{badge}</span>
                  <div>
                    <h4 className={`text-base font-bold ${player.isCurrentlyOut ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{player.name}</h4>
                    {!player.isCurrentlyOut && <span className='text-xxs uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold tracking-wide'>В игре</span>}
                  </div>
                </div>

                {/* Статистика расходов */}
                <div className='flex items-center gap-6 text-xs text-slate-400 font-mono'>
                  <div className='text-right hidden sm:block'>
                    <span className='text-xxs text-slate-600 block uppercase'>Активность:</span>
                    <span>
                      {player.rebuysCount > 0 ? `🔄 ${player.rebuysCount} реб.` : 'Без ребаев'}
                      {player.hasAddon && ' | ➕ аддон'}
                    </span>
                  </div>

                  {showCurrency && (
                    <div className='text-right border-l border-slate-800 pl-4 w-24'>
                      <span className='text-xxs text-slate-600 block uppercase'>Внесено:</span>
                      <span className='font-bold text-slate-300'>{player.totalInvested} ₽</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* КНОПКА ПОЛНОГО СБРОСА */}
      <div className='text-center pt-2'>
        <button onClick={resetGame} className='bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-6 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer'>
          🔄 Очистить и начать новый турнир
        </button>
      </div>
    </div>
  );
}
