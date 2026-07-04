import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';

// import levelUpSound from '../assets/ending-sound-effect.mp3';
// import levelUpSound from '../assets/vokzal.mp3';
import levelUpSound from '../assets/round.mp3';

const GameContext = createContext();

const defaultSettings = {
  title: 'Домашний турнир по покер',
  buyInCost: 400,
  buyInStack: 20000,
  rebuyBaseStep: 200,
  rebuyTriggerBB: 3000,
  addonCost: 0,
  addonStack: 0,
  addonLevel: 8, // На каком ИГРОВОМ уровне (не перерыве) доступен аддон
  levels: [
    { id: 1, sb: 100, bb: 200, ante: 0, duration: 1200, isBreak: false }, // 1200 сек = 20 минут
    { id: 2, sb: 100, bb: 200, ante: 0, duration: 1200, isBreak: false },
    { id: 3, sb: 200, bb: 400, ante: 0, duration: 1200, isBreak: false },
    { id: 4, duration: 900, isBreak: true, name: 'Перерыв' }, // 900 сек = 15 минут
    { id: 5, sb: 300, bb: 600, ante: 0, duration: 1200, isBreak: false },
    { id: 6, sb: 500, bb: 1000, ante: 0, duration: 1200, isBreak: false },
    { id: 7, sb: 700, bb: 1400, ante: 0, duration: 1200, isBreak: false },
    { id: 8, duration: 900, isBreak: true, name: 'Перерыв' },
    { id: 9, sb: 1000, bb: 2000, ante: 0, duration: 1200, isBreak: false },
    { id: 10, sb: 1500, bb: 3000, ante: 0, duration: 1200, isBreak: false },
    { id: 11, sb: 2000, bb: 4000, ante: 0, duration: 1200, isBreak: false },
    { id: 12, duration: 900, isBreak: true, name: 'Перерыв' },
    { id: 13, sb: 3000, bb: 6000, ante: 0, duration: 1200, isBreak: false },
    { id: 14, sb: 4000, bb: 8000, ante: 0, duration: 1200, isBreak: false },
    { id: 15, sb: 5000, bb: 10000, ante: 0, duration: 1200, isBreak: false },
    { id: 16, duration: 900, isBreak: true, name: 'Перерыв' },
    { id: 17, sb: 10000, bb: 20000, ante: 0, duration: 1200, isBreak: false },
    { id: 18, sb: 20000, bb: 40000, ante: 0, duration: 1200, isBreak: false },
    { id: 19, sb: 30000, bb: 60000, ante: 0, duration: 1200, isBreak: false },
  ],
};

export const GameProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('poker_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('poker_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('poker_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentLevelIndex, setCurrentLevelIndex] = useState(() => {
    return Number(localStorage.getItem('poker_current_level') || 0);
  });

  const [showCurrency, setShowCurrency] = useState(true);

  const [timerState, setTimerState] = useState(() => {
    const saved = localStorage.getItem('poker_timer_state');
    return saved ? JSON.parse(saved) : { startedAt: null, pausedAt: null, accumulatedPauseTime: 0 };
  });

  const [timeLeft, setTimeLeft] = useState(settings.levels[currentLevelIndex]?.duration || 900);
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('poker_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('poker_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('poker_players', JSON.stringify(players));
  }, [players]);
  useEffect(() => {
    localStorage.setItem('poker_current_level', currentLevelIndex);
  }, [currentLevelIndex]);
  useEffect(() => {
    localStorage.setItem('poker_timer_state', JSON.stringify(timerState));
  }, [timerState]);

  const calculateTimeLeft = () => {
    const currentLevel = settings.levels[currentLevelIndex];
    if (!currentLevel) return 0;
    const totalDuration = currentLevel.duration;
    if (!timerState.startedAt) return totalDuration;

    const now = Date.now();
    let totalPausedDuration = timerState.accumulatedPauseTime;
    if (timerState.pausedAt) totalPausedDuration += Math.floor((now - timerState.pausedAt) / 1000);

    const timePassedSinceStart = Math.floor((now - timerState.startedAt) / 1000);
    const netTimePassed = timePassedSinceStart - totalPausedDuration;
    const remaining = totalDuration - netTimePassed;
    return remaining > 0 ? remaining : 0;
  };

  useEffect(() => {
    const tick = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // ИСПРАВЛЕНО: Звуковое предупреждение за 3, 2, 1 секунду до конца раунда
      if (remaining > 0 && remaining <= 3 && timerState.startedAt && !timerState.pausedAt) {
        playSound('TICK');
      }

      if (remaining <= 0 && timerState.startedAt && !timerState.pausedAt) {
        handleNextLevel();
      }
    };

    tick();

    if (timerState.startedAt && !timerState.pausedAt) intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerState, currentLevelIndex, settings]);

  // ДИНАМИЧЕСКИЙ РАСЧЕТ: Порядковый номер игрового уровня (без учета перерывов)
  const displayLevelNumber = useMemo(() => {
    let gameLevelCount = 0;
    for (let i = 0; i <= currentLevelIndex; i++) {
      if (settings.levels[i] && !settings.levels[i].isBreak) {
        gameLevelCount++;
      }
    }
    return gameLevelCount;
  }, [currentLevelIndex, settings.levels]);

  // ЭКШЕНЫ ТАЙМЕРА
  const toggleTimer = () => {
    const now = Date.now();
    if (!timerState.startedAt) {
      setTimerState({ startedAt: now, pausedAt: null, accumulatedPauseTime: 0 });
    } else if (timerState.pausedAt) {
      const pauseDuration = Math.floor((now - timerState.pausedAt) / 1000);
      setTimerState(prev => ({ ...prev, pausedAt: null, accumulatedPauseTime: prev.accumulatedPauseTime + pauseDuration }));
    } else {
      setTimerState(prev => ({ ...prev, pausedAt: now }));
    }
  };

  // Улучшенный аудио-контроллер на Web Audio API
  const playSound = type => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // СЦЕНАРИЙ 1: Бархатный, мягкий перебор фишек (без резкого звона)
      // СЦЕНАРИЙ 1: Воспроизведение вашего качественного MP3 файла
      if (type === 'LEVEL_UP') {
        const audio = new Audio(levelUpSound);
        audio.volume = 1;
        audio.play().catch(e => console.log('Браузер заблокировал автозвук:', e));
      }

      // СЦЕНАРИЙ 2: Мягкий гармонический аккорд для ухода на перерыв
      if (type === 'BREAK') {
        const tones = [261.63, 329.63, 392.0, 523.25]; // Аккорд До-мажор
        const gainNode = ctx.createGain();

        // ИСПРАВЛЕНО: Уменьшили громкость с 0.2 до 0.05 (в 4 раза тише)
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5); // Плавное эхо
        gainNode.connect(ctx.destination);

        tones.forEach(freq => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(gainNode);
          osc.start();
          osc.stop(ctx.currentTime + 2.5);
        });
      }

      // СЦЕНАРИЙ 3: Короткий предупреждающий "Бип" для финального отсчета
      if (type === 'TICK') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // Стандартная нота Ля (чистый писк)

        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15); // Очень короткий звук

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.error('Аудио временно заблокировано браузером:', e);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = settings.levels[currentLevelIndex + 1];

    // Выбираем звук в зависимости от того, куда переключаемся
    if (nextLevel) {
      if (nextLevel.isBreak) {
        playSound('BREAK'); // Включаем аккорд перерыва
      } else {
        playSound('LEVEL_UP'); // Включаем сирену блайндов
      }
    }

    if (currentLevelIndex < settings.levels.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setTimerState({ startedAt: Date.now(), pausedAt: null, accumulatedPauseTime: 0 });
    } else {
      setTimerState({ startedAt: null, pausedAt: null, accumulatedPauseTime: 0 });
      alert('Турнир окончен!');
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(prev => prev - 1);
      setTimerState({ startedAt: Date.now(), pausedAt: null, accumulatedPauseTime: 0 });
    }
  };

  const addTimeToCurrentRound = minutes => {
    if (!timerState.startedAt) return alert('Сначала запустите таймер!');
    setTimerState(prev => ({ ...prev, accumulatedPauseTime: prev.accumulatedPauseTime + minutes * 60 }));
  };

  // ПОКЕРНАЯ ЭКОНОМИКА С ПОДДЕРЖКОЙ RE-ENTRY
  const calculateNextRebuy = (playerName) => {
    // 1. Извлекаем все ребаи игрока в хронологическом порядке
    const playerRebuyEvents = events.filter(
      e => e.type === 'REBUY' && e.playerName === playerName
    );

    const currentLevel = settings.levels[currentLevelIndex];
    const isHeavyBlindsNow = currentLevel && currentLevel.bb >= settings.rebuyTriggerBB;

    // 2. Стартуем с базовой цены
    let currentCost = settings.buyInCost;

    // 3. Симулируем историю строго по блайндам турнира
    playerRebuyEvents.forEach((event) => {
      // ИСПРАВЛЕНО: Теперь мы железно проверяем, на каком уровне блайндов был сделан этот прошлый ребай.
      // Если на момент того ребая Большой Блайнд (bb) уже был тяжелым (например, >= 1600),
      // то только тогда цена после него увеличивается умножением на 2.
      const rebuyLevel = settings.levels.find(l => l.id === event.levelId) || event.currentLevel;
      const isHeavyAtThatMoment = rebuyLevel && rebuyLevel.bb >= settings.rebuyTriggerBB;

      if (isHeavyAtThatMoment) {
        currentCost = event.cost * 2;
      } else {
        // Если ребай сделан на ранней стадии — просто прибавляем обычный шаг 200р
        currentCost = event.cost + settings.rebuyBaseStep;
      }
    });

    // 4. Расчет для ребая, который игрок делает ПРЯМО СЕЙЧАС (текущий клик):
    if (isHeavyBlindsNow) {
      // Проверяем, заходил ли уже игрок на тяжелую стадию.
      // Ищем, был ли хоть один ребай в истории сделан на тяжелых блайндах.
      const hasAnyHeavyRebuyInHistory = playerRebuyEvents.some(event => {
        const rebuyLevel = settings.levels.find(l => l.id === event.levelId) || event.currentLevel;
        return rebuyLevel && rebuyLevel.bb >= settings.rebuyTriggerBB;
      });

      // Если в истории еще не было тяжелых ребаев, это значит, что игрок
      // ПЕРВЫЙ РАЗ покупает ребай на тяжелой стадии. Мы должны принудительно удвоить его накопленную цену!
      if (!hasAnyHeavyRebuyInHistory) {
        currentCost = currentCost * 2;
      }
    }

    return { 
      cost: currentCost, 
      stack: settings.buyInStack 
    };
  };


  const addPlayer = nameOrArray => {
    const newNames = Array.isArray(nameOrArray) ? nameOrArray : [nameOrArray];
    const uniqueNewNames = newNames.filter(name => !players.includes(name));
    if (uniqueNewNames.length === 0) return;

    setPlayers(prev => [...prev, ...uniqueNewNames]);
    const newEvents = uniqueNewNames.map(name => ({
      id: crypto.randomUUID(),
      type: 'BUY_IN',
      playerName: name,
      cost: settings.buyInCost,
      stack: settings.buyInStack,
      timestamp: Date.now(),
    }));
    setEvents(prev => [...prev, ...newEvents]);
  };

  const playerRebuy = (playerName) => {
    const nextRebuy = calculateNextRebuy(playerName);
    const currentLevel = settings.levels[currentLevelIndex];

    setEvents(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'REBUY',
      playerName,
      cost: nextRebuy.cost,
      stack: nextRebuy.stack,
      levelId: currentLevel?.id, // <-- ЖЕЛЕЗНО ПИШЕМ ID УРОВНЯ
      timestamp: Date.now()
    }]);
  };

  const playerOut = playerName => {
    const livePlayersBefore = players.filter(name => {
      const playerEvents = events.filter(e => e.playerName === name);
      if (playerEvents.length === 0) return false;
      return playerEvents[playerEvents.length - 1].type !== 'PLAYER_OUT';
    });

    const eventId = crypto.randomUUID();
    const outPlace = livePlayersBefore.length;

    const updatedEvents = [
      ...events,
      {
        id: eventId,
        type: 'PLAYER_OUT',
        playerName,
        place: outPlace,
        timestamp: Date.now(),
      },
    ];

    setEvents(updatedEvents);

    const livePlayersAfter = players.filter(name => {
      const playerEvents = updatedEvents.filter(e => e.playerName === name);
      if (playerEvents.length === 0) return false;
      return playerEvents[playerEvents.length - 1].type !== 'PLAYER_OUT';
    });

    if (livePlayersAfter.length === 1 && timerState.startedAt && !timerState.pausedAt) {
      setTimerState(prev => ({
        ...prev,
        pausedAt: Date.now(),
      }));
    }
  };

  const playerAddon = playerName => {
    const alreadyHasAddon = events.some(e => e.type === 'ADDON' && e.playerName === playerName);
    if (alreadyHasAddon) return alert('Аддон уже сделан!');
    setEvents(prev => [...prev, { id: crypto.randomUUID(), type: 'ADDON', playerName, cost: settings.addonCost, stack: settings.addonStack, timestamp: Date.now() }]);
  };

  const undoLastEvent = () => {
    if (events.length > 0) setEvents(prev => prev.slice(0, -1));
  };

  const resetGame = () => {
    if (window.confirm('Сбросить игру?')) {
      setEvents([]);
      setPlayers([]);
      setCurrentLevelIndex(0);
      setTimerState({ startedAt: null, pausedAt: null, accumulatedPauseTime: 0 });
      setTimeLeft(settings.levels[0]?.duration || 900);
    }
  };

  // ПОДСЧЕТ СТАТИСТИКИ ТУРНИРА ПОСЛЕДОВАТЕЛЬНО ПО ЛОГУ Событий
  const stats = useMemo(() => {
    let totalBank = 0;
    let totalChips = 0;
    events.forEach(e => {
      if (['BUY_IN', 'REBUY', 'ADDON'].includes(e.type)) {
        totalBank += e.cost;
        totalChips += e.stack;
      }
    });

    // Игрок в игре, если его последнее хронологическое событие — НЕ аут
    const livePlayersCount = players.filter(name => {
      const pEvents = events.filter(e => e.playerName === name);
      if (pEvents.length === 0) return false;
      return pEvents[pEvents.length - 1].type !== 'PLAYER_OUT';
    }).length;

    const totalEntries = events.filter(e => ['BUY_IN', 'REBUY'].includes(e.type)).length;
    const averageStack = livePlayersCount > 0 ? Math.round(totalChips / livePlayersCount) : 0;

    return { totalBank, totalChips, playersInGame: livePlayersCount, totalEntries, averageStack };
  }, [events, players]);

  return (
    <GameContext.Provider value={{
      settings, setSettings, events, players, currentLevelIndex, showCurrency, setShowCurrency, stats, timeLeft, displayLevelNumber,
      isTimerRunning: timerState.startedAt && !timerState.pausedAt,
      addPlayer, playerRebuy, playerOut, playerAddon, calculateNextRebuy, undoLastEvent, resetGame,
      toggleTimer, handleNextLevel, handlePrevLevel, addTimeToCurrentRound
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
