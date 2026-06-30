import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function SetupView() {
  const { settings, setSettings, players, addPlayer, resetGame } = useGame();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [bulkPlayersText, setBulkPlayersText] = useState('');

  // Изменение общих настроек (цены, стеки)
  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: Number(value) || value,
    }));
  };

  // Добавление одного игрока
  const handleAddSinglePlayer = e => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  // Пакетное добавление игроков
  const handleBulkAddPlayers = () => {
    if (!bulkPlayersText.trim()) return;
    const names = bulkPlayersText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    addPlayer(names);
    setBulkPlayersText('');
  };

  // Изменение минут или секунд раунда
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

  // Изменение блайндов и анте
  const handleLevelChange = (index, field, value) => {
    const updatedLevels = [...settings.levels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      [field]: Number(value) || 0,
    };
    setSettings(prev => ({ ...prev, levels: updatedLevels }));
  };

  // Удаление уровня
  const handleRemoveLevel = index => {
    const updatedLevels = settings.levels.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, levels: updatedLevels }));
  };

  // Добавление нового уровня или перерыва
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

  return (
    <div className='w-full max-w-5xl mx-auto space-y-8 p-4'>
      {/* СЕТКА НАСТРОЕК ЭКОНОМИКИ И ИГРОКОВ */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Финансовые настройки */}
        <div className='bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4'>
          <h3 className='text-lg font-bold text-amber-400 mb-2'>💰 Финансы и Стек</h3>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Вход (Buy-in), ₽</label>
              <input type='number' value={settings.buyInCost} onChange={e => handleSettingChange('buyInCost', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Стартовый стек</label>
              <input type='number' value={settings.buyInStack} onChange={e => handleSettingChange('buyInStack', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Шаг ребая (прогресс), ₽</label>
              <input type='number' value={settings.rebuyBaseStep} onChange={e => handleSettingChange('rebuyBaseStep', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
            <div>
              <label className='text-xs text-slate-400 block mb-1'>Удвоение ребая при ББ от</label>
              <input type='number' value={settings.rebuyTriggerBB} onChange={e => handleSettingChange('rebuyTriggerBB', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-4'>
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>Цена аддона, ₽</label>
              <input type='number' value={settings.addonCost} onChange={e => handleSettingChange('addonCost', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>Стек аддона</label>
              <input type='number' value={settings.addonStack} onChange={e => handleSettingChange('addonStack', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
            {/* ДОБАВЛЕНО: Указание уровня для аддона */}
            <div>
              <label className='text-xxs text-slate-400 block mb-1'>На каком ур.</label>
              <input type='number' value={settings.addonLevel || 4} onChange={e => handleSettingChange('addonLevel', e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500' />
            </div>
          </div>
        </div>

        {/* Управление игроками */}
        <div className='bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between'>
          <div>
            <h3 className='text-lg font-bold text-sky-400 mb-4'>👥 Игроки ({players.length})</h3>

            <form onSubmit={handleAddSinglePlayer} className='flex gap-2 mb-4'>
              <input type='text' placeholder='Имя игрока' value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className='flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500' />
              <button type='submit' className='bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-xl text-sm font-bold text-black transition'>
                + В игру
              </button>
            </form>

            <div className='space-y-2'>
              <label className='text-xs text-slate-400 block'>Импорт списком (каждое имя с новой строки):</label>
              <textarea
                rows='3'
                value={bulkPlayersText}
                onChange={e => setBulkPlayersText(e.target.value)}
                placeholder='Иван&#10;Алексей&#10;Мария'
                className='w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-500'
              />
              <button onClick={handleBulkAddPlayers} className='w-full bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs py-1.5 rounded-lg border border-slate-700 transition'>
                Добавить всех из списка
              </button>
            </div>
          </div>

          <div className='mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between'>
            <span className='text-xs text-slate-500'>Игроки сразу делают Buy-in при добавлении</span>
            <button onClick={resetGame} className='text-xs bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-900/50 text-rose-400 transition'>
              ⚠️ Сбросить всю игру
            </button>
          </div>
        </div>
      </div>

      {/* УПРАВЛЕНИЕ СТРУКТУРОЙ БЛАЙНДОВ */}
      <div className='bg-slate-900 border border-slate-800 p-6 rounded-2xl'>
        <div className='flex flex-wrap justify-between items-center gap-4 mb-4'>
          <h3 className='text-lg font-bold text-emerald-400'>⏱️ Уровни и структура блайндов</h3>
          <div className='flex gap-2'>
            <button onClick={() => handleAddLevel(false)} className='bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs px-3 py-2 rounded-xl transition'>
              + Уровень блайндов
            </button>
            <button onClick={() => handleAddLevel(true)} className='bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-xl transition'>
              + Перерыв
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-slate-300'>
            <thead>
              <tr className='border-b border-slate-800 text-slate-500 uppercase tracking-wider text-xs'>
                <th className='py-3 px-2 w-12 text-center'>#</th>
                <th className='py-3 px-2'>Тип уровня</th>
                <th className='py-3 px-2 w-28'>М. Блайнд</th>
                <th className='py-3 px-2 w-28'>Б. Блайнд</th>
                <th className='py-3 px-2 w-24'>Анте</th>
                <th className='py-3 px-2 w-44'>Время (Мин : Сек)</th>
                <th className='py-3 px-2 w-12'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/40'>
              {settings.levels.map((level, index) => {
                const duration = level.duration || 0;
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;

                return (
                  <tr key={level.id} className={`hover:bg-slate-950/40 transition ${level.isBreak ? 'bg-emerald-500/5' : ''}`}>
                    <td className='py-2 px-2 text-center font-mono text-slate-500'>{index + 1}</td>

                    <td className='py-2 px-2'>{level.isBreak ? <span className='text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded'>Перерыв</span> : <span className='text-xs font-medium text-slate-400'>Игра</span>}</td>

                    <td className='py-2 px-2'>{!level.isBreak && <input type='number' value={level.sb} onChange={e => handleLevelChange(index, 'sb', e.target.value)} className='w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    <td className='py-2 px-2'>{!level.isBreak && <input type='number' value={level.bb} onChange={e => handleLevelChange(index, 'bb', e.target.value)} className='w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    <td className='py-2 px-2'>{!level.isBreak && <input type='number' value={level.ante} onChange={e => handleLevelChange(index, 'ante', e.target.value)} className='w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none' />}</td>

                    {/* Раздельные инпуты под минуты и секунды */}
                    <td className='py-2 px-2'>
                      <div className='flex items-center gap-1'>
                        <input type='number' value={minutes} onChange={e => handleTimeChange(index, 'min', e.target.value)} placeholder='15' className='w-16 bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1 text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-600' />
                        <span className='text-slate-600 font-bold'>:</span>
                        <input type='number' value={seconds} onChange={e => handleTimeChange(index, 'sec', e.target.value)} placeholder='00' className='w-14 bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1 text-xs font-mono text-center text-white focus:outline-none focus:border-emerald-600' />
                      </div>
                    </td>

                    <td className='py-2 px-2 text-center'>
                      <button onClick={() => handleRemoveLevel(index)} className='text-slate-600 hover:text-rose-400 text-xs transition p-1' title='Удалить уровень'>
                        ❌
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
