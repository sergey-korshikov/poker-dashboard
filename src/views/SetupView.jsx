import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function SetupView() {
  const { settings, setSettings, players, addPlayer, resetGame } = useGame();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [bulkPlayersText, setBulkPlayersText] = useState('');

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: Number(value) || value,
    }));
  };

  const handleAddSinglePlayer = e => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleBulkAddPlayers = () => {
    if (!bulkPlayersText.trim()) return;
    const names = bulkPlayersText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    addPlayer(names);
    setBulkPlayersText('');
  };

  const handleTimeChange = (index, type, value) => {
    const updatedLevels = [...settings.levels];
    const currentDuration = updatedLevels[index].duration || 0;

    const currentMinutes = Math.floor(currentDuration / 60);
    const currentSeconds = currentDuration % 60;

    let newDuration = currentDuration;
    if (type === 'min') {
      newDuration = (Number(value) || 0) * 60 + currentSeconds;
    } else if (type === 'sec') {
      newDuration = currentMinutes * 60 + (Number(value) || 0);
    }

    updatedLevels[index] = { ...updatedLevels[index], duration: newDuration };
    setSettings(prev => ({ ...prev, levels: updatedLevels }));
  };

  const handleLevelChange = (index, field, value) => {
    const updatedLevels = [...settings.levels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      [field]: Number(value) || 0,
    };
    setSettings(prev => ({ ...prev, levels: updatedLevels }));
  };

  const handleRemoveLevel = index => {
    const updatedLevels = settings.levels.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, levels: updatedLevels }));
  };

  const handleAddLevel = (isBreak = false) => {
    const lastLevel = settings.levels[settings.levels.length - 1];
    const newLevel = isBreak
      ? { id: Date.now(), duration: 900, isBreak: true, name: 'Перерыв' }
      : {
          id: Date.now(),
          sb: (lastLevel?.sb || 100) * 2,
          bb: (lastLevel?.bb || 200) * 2,
          ante: lastLevel?.ante || 0,
          duration: 1200,
          isBreak: false,
        };

    setSettings(prev => ({ ...prev, levels: [...prev.levels, newLevel] }));
  };

  let gameLevelCounter = 0;
  const levelNames = settings.levels.map(level => {
    if (level.isBreak) return 'Перерыв';
    gameLevelCounter++;
    return `Уровень ${gameLevelCounter}`;
  });
  return (
    <div className='w-full max-w-5xl mx-auto space-y-6 p-4'>
      {/* СЕТКА НАСТРОЕК ЭКОНОМИКИ И ИГРОКОВ */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Финансовые настройки */}
        <div className='bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-md'>
          <h3 className='text-sm font-medium text-white tracking-wider'>Финансы и Стек</h3>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Вход (Buy-in), ₽</label>
              <input type='number' min={0} value={settings.buyInCost} onChange={e => handleSettingChange('buyInCost', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Стартовый стек</label>
              <input type='number' min={0} value={settings.buyInStack} onChange={e => handleSettingChange('buyInStack', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Шаг ребая (прогресс), ₽</label>
              <input type='number' min={0} value={settings.rebuyBaseStep} onChange={e => handleSettingChange('rebuyBaseStep', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
            <div>
              {/* ИСПРАВЛЕНО: Фраза заменена на "Удвоение ребая при ББ от" */}
              <label className='text-xs text-slate-400 block mb-1'>Удвоение ребая при ББ от</label>
              <input type='number' min={0} value={settings.rebuyTriggerBB} onChange={e => handleSettingChange('rebuyTriggerBB', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-4'>
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>Цена аддона, ₽</label>
              <input type='number' min={0} value={settings.addonCost} onChange={e => handleSettingChange('addonCost', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-2 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>Стек аддона</label>
              <input type='number' min={0} value={settings.addonStack} onChange={e => handleSettingChange('addonStack', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-2 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>На каком уровне</label>
              <input type='number' min={0} value={settings.addonLevel || 4} onChange={e => handleSettingChange('addonLevel', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-2 h-9 text-xs font-mono text-white focus:outline-none' />
            </div>
          </div>
        </div>

        {/* Управление игроками */}
        <div className='bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-md'>
          <div>
            <h3 className='text-sm font-medium text-white tracking-wider mb-4'>Игроки ({players.length})</h3>

            <form onSubmit={handleAddSinglePlayer} className='flex gap-2 mb-4'>
              <input type='text' placeholder='Имя игрока' value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className='flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 h-9 text-sm text-white focus:outline-none' />
              <button type='submit' className='bg-white hover:bg-slate-200 text-black font-medium text-xs uppercase tracking-wider px-4 h-9 rounded-lg transition duration-150 cursor-pointer'>
                Добавить
              </button>
            </form>

            <div className='space-y-2'>
              <label className='text-xs text-slate-400 block'>Импорт участников списком (каждое имя с новой строки):</label>
              <textarea
                rows='3'
                value={bulkPlayersText}
                onChange={e => setBulkPlayersText(e.target.value)}
                placeholder='Иван&#10;Алексей&#10;Мария'
                className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none resize-none'
              />
              <button onClick={handleBulkAddPlayers} className='w-full bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium text-xs h-9 rounded-lg border border-slate-700 transition duration-150 cursor-pointer'>
                Загрузить список
              </button>
            </div>
          </div>

          <div className='mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4'>
            <span className='text-xs text-slate-500 italic'>Игроки сразу делают Buy-in</span>
            <button onClick={resetGame} className='text-xs bg-slate-950 hover:bg-slate-900 text-rose-400 border border-rose-950 px-3 h-9 rounded-lg transition duration-150 cursor-pointer'>
              Сбросить всю игру
            </button>
          </div>
        </div>
      </div>
      {/* УПРАВЛЕНИЕ СТРУКТУРОЙ БЛАЙНДОВ */}
      <div className='bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl'>
        <div className='flex flex-wrap justify-between items-center gap-4 mb-4'>
          <h3 className='text-sm font-medium text-white tracking-wider'>Структура блайндов</h3>
          <div className='flex gap-2'>
            <button onClick={() => handleAddLevel(false)} className='bg-white hover:bg-slate-200 text-black font-medium text-xs px-3 h-9 rounded-xl transition duration-150 cursor-pointer'>
              + Добавить уровень
            </button>
            <button onClick={() => handleAddLevel(true)} className='bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-3 h-9 rounded-xl transition duration-150 cursor-pointer'>
              + Добавить перерыв
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-slate-300'>
            <thead>
              <tr className='border-b border-slate-800 text-slate-500 text-xs font-medium'>
                <th className='py-3 px-2 w-32'>Раунд</th>
                <th className='py-3 px-2 w-24'>Тип</th>
                <th className='py-3 px-2 w-28 font-mono'>МБ</th>
                <th className='py-3 px-2 w-28 font-mono'>ББ</th>
                <th className='py-3 px-2 w-24 font-mono'>Анте</th>
                <th className='py-3 px-2 w-48 font-mono'>Время (мин : сек)</th>
                <th className='py-3 px-2 w-24 text-center'>Действие</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/40'>
              {settings.levels.map((level, index) => {
                const duration = level.duration || 0;
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const currentName = levelNames[index];

                return (
                  <tr key={level.id} className={`hover:bg-slate-950/40 transition ${level.isBreak ? 'bg-slate-950/80 border-y border-slate-800' : ''}`}>
                    <td className='py-2.5 px-2'>
                      <span className={`text-xs font-medium ${level.isBreak ? 'text-emerald-400' : 'text-slate-300'}`}>{currentName}</span>
                    </td>

                    <td className='py-2.5 px-2'>
                      <span className='text-xs text-slate-400 font-normal'>{level.isBreak ? 'Отдых' : 'Игра'}</span>
                    </td>

                    <td className='py-2.5 px-2'>{!level.isBreak && <input type='number' min={0} value={level.sb} onChange={e => handleLevelChange(index, 'sb', e.target.value)} className='w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    <td className='py-2.5 px-2'>{!level.isBreak && <input type='number' min={0} value={level.bb} onChange={e => handleLevelChange(index, 'bb', e.target.value)} className='w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    <td className='py-2.5 px-2'>{!level.isBreak && <input type='number' min={0} value={level.ante} onChange={e => handleLevelChange(index, 'ante', e.target.value)} className='w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    <td className='py-2.5 px-2'>
                      <div className='flex items-center gap-1'>
                        <input type='number' min={0} value={minutes} onChange={e => handleTimeChange(index, 'min', e.target.value)} placeholder='15' className='w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-center text-white focus:outline-none' />
                        <span className='text-slate-600 font-normal font-mono'>:</span>
                        <input type='number' min={0} value={seconds} onChange={e => handleTimeChange(index, 'sec', e.target.value)} placeholder='00' className='w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-center text-white focus:outline-none' />
                      </div>
                    </td>

                    <td className='py-2.5 px-2 text-center'>
                      <button onClick={() => handleRemoveLevel(index)} className='text-rose-400 bg-slate-950 hover:bg-slate-900 border border-rose-950 px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer'>
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
