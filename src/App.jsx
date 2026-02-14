import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cat from './components/Cat';
import Target from './components/Target';
import CheerleaderSystem, { getCheerleaderImage } from './components/Cheerleader';
import { sendScoreEmail } from './emailService';

const MAX_SCORE = 40;
const WIN_THRESHOLD = 32;
const HIT_RADIUS_X = 15;
const HIT_RADIUS_Y = 20;
const TARGET_LIFETIME = 25000;
const TARGET_STAY_DURATION = 20000;

// === SKINS ===
const SKIN_OPTIONS = ['ginger', 'cream', 'grey', 'tuxedo', 'white', 'calico'];

// === ITEM VALUES & CHANCES ===
const ITEM_STATS = {
  // GOOD
  fish: { points: 1, weight: 100 },
  yarn: { points: 1, weight: 60 },
  yarn_blue: { points: 1, weight: 60 },
  yarn_yellow: { points: 1, weight: 60 },
  mouse: { points: 2, weight: 60 },
  bird: { points: 2, weight: 50 },
  bird_red: { points: 2, weight: 40 },
  bird_blue: { points: 2, weight: 40 },
  bird_yellow: { points: 2, weight: 40 },
  milk: { points: 3, weight: 30 },
  can: { points: 3, weight: 25 },
  catnip: { points: 3, weight: 10 },

  // SPECIAL - Extra Life
  heart_life: { points: 0, weight: 5, isLife: true }, // V2: Restores 1 life

  // BAD
  spray: { points: -1, weight: 100 },
  water: { points: -1, weight: 90 },
  cucumber: { points: -2, weight: 70 },
  cactus: { points: -2, weight: 60 },
  dog: { points: -3, weight: 40 },
  dog_brown: { points: -3, weight: 35 },
  dog_black: { points: -3, weight: 35 },
  dog_spotted: { points: -3, weight: 30 },
  vacuum: { points: -3, weight: 35 },
  thunder: { points: -4, weight: 20 },
  bomb: { points: -5, weight: 10 },
  bee: { points: -5, weight: 10 }, // REPLACED TRAP
  broom: { points: -4, weight: 25 }, // NEW
  ghost: { points: -5, weight: 5 },
};

function App() {
  const [gameState, setGameState] = useState('onboarding');
  const [catNames, setCatNames] = useState({ ginger: 'Ginger', cream: 'Cream' });
  const [tempNames, setTempNames] = useState({ ginger: '', cream: '' });
  const [playerName, setPlayerName] = useState('');

  // V2: Scoring & Levels
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('kitty_high_score') || '0'));

  // V2: Lives System
  const [gingerLives, setGingerLives] = useState(3);
  const [creamLives, setCreamLives] = useState(3);

  // Cat Skins State
  const [catSkins, setCatSkins] = useState({ ginger: 'ginger', cream: 'cream' });

  const [gingerProgress, setGingerProgress] = useState(0);
  const [creamProgress, setCreamProgress] = useState(0);
  const [targets, setTargets] = useState([]);
  const [cheers, setCheers] = useState([]);

  const [gingerState, setGingerState] = useState('idle');
  const [creamState, setCreamState] = useState('idle');
  const [shake, setShake] = useState(false);
  const [finalHeartActive, setFinalHeartActive] = useState(false);

  // REFS
  const targetsRef = useRef([]);
  const gameStateRef = useRef('onboarding');
  const progressRef = useRef({ ginger: 0, cream: 0 });
  const heartActiveRef = useRef(false);
  const lastPress = useRef({ left: 0, right: 0 });
  const requestRef = useRef();
  const spawnHistory = useRef([]);

  // Sync Refs
  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { progressRef.current = { ginger: gingerProgress, cream: creamProgress }; }, [gingerProgress, creamProgress]);
  useEffect(() => { heartActiveRef.current = finalHeartActive; }, [finalHeartActive]);

  // V2: Score Ref for game loop
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // V2: LEVEL LOGIC
  useEffect(() => {
    if (score > 300 && level < 5) {
      const newLevel = Math.floor(score / 300) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        addCheer(50, 50, `LEVEL ${newLevel}!`, true);
      }
    }
  }, [score, level]);

  // V2: START GAME with validation
  const startGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name!");
      return;
    }
    if (!tempNames.ginger.trim() || !tempNames.cream.trim()) {
      alert("Please enter names for both cats!");
      return;
    }
    const gName = tempNames.ginger || 'Left Cat';
    const cName = tempNames.cream || 'Right Cat';
    setCatNames({ ginger: gName, cream: cName });
    setScore(0);
    setLevel(1);
    setGingerProgress(0);
    setCreamProgress(0);
    setGingerLives(3);
    setCreamLives(3);
    setTargets([]);
    setGameState('playing');
  };

  // SYMMETRIC POSITIONING LOGIC
  const gingerPos = 15 + (35 * (gingerProgress / MAX_SCORE));
  const creamPos = 85 - (35 * (creamProgress / MAX_SCORE));

  // V2: EMAIL SCORE
  const handleSaveScore = async () => {
    const btn = document.getElementById('save-btn');
    if (btn) { btn.innerText = "Sending Email..."; btn.disabled = true; }

    const result = await sendScoreEmail(playerName, catNames, catSkins, score);

    if (result.success) {
      if (btn) btn.innerText = "Email Sent! 📧";
    } else {
      if (btn) { btn.innerText = "Failed - Try Again"; btn.disabled = false; }
    }
  };

  const cycleSkin = (side, direction) => {
    setCatSkins(prev => {
      const current = prev[side];
      const idx = SKIN_OPTIONS.indexOf(current);
      let newIdx = idx + direction;
      if (newIdx < 0) newIdx = SKIN_OPTIONS.length - 1;
      if (newIdx >= SKIN_OPTIONS.length) newIdx = 0;
      return { ...prev, [side]: SKIN_OPTIONS[newIdx] };
    });
  };

  // --- Helpers ---
  const getRandomItem = (isBad) => {
    const pool = Object.keys(ITEM_STATS).filter(k => {
      const p = ITEM_STATS[k].points;
      return isBad ? p < 0 : p > 0;
    });
    const totalWeight = pool.reduce((acc, k) => acc + ITEM_STATS[k].weight, 0);
    let r = Math.random() * totalWeight;
    for (let k of pool) {
      r -= ITEM_STATS[k].weight;
      if (r <= 0) return k;
    }
    return pool[0];
  };

  // --- Spawning Logic ---
  const spawnTarget = useCallback(() => {
    if (targetsRef.current.length >= 10) return;

    if (progressRef.current.ginger >= WIN_THRESHOLD && progressRef.current.cream >= WIN_THRESHOLD && !heartActiveRef.current) {
      setFinalHeartActive(true);
      setTargets([{
        id: 'final-heart',
        type: 'heart',
        x: 50, y: 50,
        dx: (Math.random() - 0.5) * 0.8,
        dy: (Math.random() - 0.5) * 0.8,
        rotation: 0, isHeart: true, createdAt: Date.now()
      }]);
      return;
    }

    let isBad = false;
    if (heartActiveRef.current) {
      isBad = true;
    } else {
      const recentBad = spawnHistory.current.slice(-4).filter(x => x === 'bad').length;
      let badChance = 0.35;
      if (recentBad >= 2) badChance = 0.10;
      else if (recentBad === 0) badChance = 0.45;
      isBad = Math.random() < badChance;
    }

    spawnHistory.current.push(isBad ? 'bad' : 'good');
    if (spawnHistory.current.length > 5) spawnHistory.current.shift();

    const type = getRandomItem(isBad);

    let startX, startY;
    const edge = Math.floor(Math.random() * 4);
    let dx = (Math.random() * 0.5 + 0.4);
    let dy = (Math.random() * 0.5 + 0.4);

    switch (edge) {
      case 0: startX = Math.random() * 80 + 10; startY = -10; dy = Math.abs(dy); dx = (Math.random() - 0.5) * 1.5; break;
      case 1: startX = 110; startY = Math.random() * 80 + 10; dx = -Math.abs(dx); dy = (Math.random() - 0.5) * 1.5; break;
      case 2: startX = Math.random() * 80 + 10; startY = 110; dy = -Math.abs(dy); dx = (Math.random() - 0.5) * 1.5; break;
      case 3: startX = -10; startY = Math.random() * 80 + 10; dx = Math.abs(dx); dy = (Math.random() - 0.5) * 1.5; break;
      default: startX = 50; startY = 50;
    }

    const newTarget = {
      id: Date.now() + Math.random(),
      createdAt: Date.now(),
      type, isBad,
      x: startX, y: startY,
      dx, dy, rotation: 0
    };
    setTargets(prev => [...prev, newTarget]);
  }, []);

  // --- Game Loop ---
  const updateGameState = () => {
    if (gameStateRef.current !== 'playing') return;
    const now = Date.now();

    setTargets(prevTargets => {
      const aliveTargets = prevTargets.filter(t => {
        if (t.isHeart) return true;
        const isOffScreen = (t.x < -20 || t.x > 120 || t.y < -20 || t.y > 120);
        const hasLived = (now - t.createdAt) > TARGET_STAY_DURATION;
        if (isOffScreen && hasLived) return false;
        return true;
      });

      return aliveTargets.map(t => {
        let { x, y, dx, dy, rotation, createdAt, isHeart } = t;
        const age = now - createdAt;
        x += dx; y += dy; rotation += 5;
        const shouldBounce = isHeart || (age < TARGET_STAY_DURATION);
        if (shouldBounce) {
          if (x <= 5 && dx < 0) dx *= -1;
          if (x >= 95 && dx > 0) dx *= -1;
          if (y <= 5 && dy < 0) dy *= -1;
          if (y >= 85 && dy > 0) dy *= -1;
        }
        return { ...t, x, y, dx, dy, rotation };
      });
    });

    if (Math.random() < 0.05) spawnTarget();
    requestRef.current = requestAnimationFrame(updateGameState);
  };

  useEffect(() => {
    if (gameState === 'playing') requestRef.current = requestAnimationFrame(updateGameState);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, spawnTarget]);

  // --- Interaction ---
  const handleAction = (side) => {
    if (gameStateRef.current !== 'playing') return;

    if (heartActiveRef.current) {
      const now = Date.now();
      if (side === 'space') {
        setGameState('victory');
        addCheer(50, 50, "TRUE LOVE!", true);
        return;
      }
      lastPress.current[side] = now;
      const other = side === 'left' ? 'right' : 'left';
      if (Math.abs(now - lastPress.current[other]) < 300) {
        // Hit logic picks it up
      }
    }

    const catY = 85;
    const currentPos = side === 'left'
      ? 15 + (35 * (progressRef.current.ginger / MAX_SCORE))
      : 85 - (35 * (progressRef.current.cream / MAX_SCORE));

    let closestDist = Infinity;
    let closestIndex = -1;

    targetsRef.current.forEach((t, i) => {
      const dx = Math.abs(t.x - currentPos);
      const dy = Math.abs(t.y - catY);

      if (dx < HIT_RADIUS_X && dy < HIT_RADIUS_Y) {
        const dist = dx * dx + dy * dy;
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      }
    });

    if (closestIndex !== -1) {
      const target = targetsRef.current[closestIndex];

      if (target.isHeart) {
        const now = Date.now();
        const other = side === 'left' ? 'right' : 'left';
        if (Math.abs(now - lastPress.current[other]) < 300) {
          setGameState('victory');
          addCheer(50, 50, "TRUE LOVE!", true);
        } else {
          addCheer(target.x, target.y - 10, "TOGETHER!", true);
        }
        return;
      }

      const stats = ITEM_STATS[target.type] || { points: 1 };
      const points = stats.points;
      const isBad = points < 0;

      setTargets(prev => prev.filter((_, i) => i !== closestIndex));

      if (isBad) {
        triggerShake();
        setScore(s => Math.max(0, s - 20)); // V2: SCORE PENALTY
        const penalty = Math.abs(points);
        // Inverse Penalty
        if (side === 'left') {
          // V2: Lose life for LEFT cat
          setGingerLives(lives => {
            const newLives = lives - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              // V2: Auto-send email with current values
              const currentScore = scoreRef.current;
              const currentName = playerName;
              const currentCatNames = catNames;
              const currentSkins = catSkins;
              setTimeout(() => sendScoreEmail(currentName, currentCatNames, currentSkins, currentScore), 1000);
            }
            return Math.max(0, newLives);
          });
          setCreamProgress(p => Math.max(p - (penalty * 1.5), 0));
          setCreamState('hurt'); setTimeout(() => setCreamState('idle'), 500);
          setGingerState('hurt'); setTimeout(() => setGingerState('idle'), 500);
        } else {
          // V2: Lose life for RIGHT cat
          setCreamLives(lives => {
            const newLives = lives - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              // V2: Auto-send email with current values
              const currentScore = scoreRef.current;
              const currentName = playerName;
              const currentCatNames = catNames;
              const currentSkins = catSkins;
              setTimeout(() => sendScoreEmail(currentName, currentCatNames, currentSkins, currentScore), 1000);
            }
            return Math.max(0, newLives);
          });
          setGingerProgress(p => Math.max(p - (penalty * 1.5), 0));
          setGingerState('hurt'); setTimeout(() => setGingerState('idle'), 500);
          setCreamState('hurt'); setTimeout(() => setCreamState('idle'), 500);
        }
      } else if (stats.isLife) {
        // V2: HEART - Restore 1 life to cat with fewer lives
        const restoredCat = gingerLives <= creamLives ? 'left' : 'right';

        if (restoredCat === 'left') {
          setGingerLives(lives => Math.min(lives + 1, 3)); // Max 3 lives
          addCheer(target.x, target.y - 10, '+1 LIFE!', true);
          setGingerState('happy'); setTimeout(() => setGingerState('idle'), 500);
        } else {
          setCreamLives(lives => Math.min(lives + 1, 3)); // Max 3 lives
          addCheer(target.x, target.y - 10, '+1 LIFE!', true);
          setCreamState('happy'); setTimeout(() => setCreamState('idle'), 500);
        }
      } else {
        // V2: Good Item - Add score with level multiplier
        const multiplier = (level * 0.5) + 0.5; // Level 1=1x, Level 5=3x
        setScore(s => s + Math.ceil(points * 10 * multiplier)); // SCORE ADD
        const points = stats.points;

        const cheerX = side === 'left' ? (65 + Math.random() * 20) : (15 + Math.random() * 20);
        const cheerY = 30 + Math.random() * 30;

        let txt = "NICE!";
        if (points === 2) txt = "GREAT!";
        if (points >= 3) txt = "WOW!!";

        addCheer(cheerX, cheerY, txt);

        if (side === 'left') {
          setGingerProgress(p => Math.min(p + points, MAX_SCORE));
          setGingerState('happy'); setTimeout(() => setGingerState('idle'), 500);
        } else {
          setCreamProgress(p => Math.min(p + points, MAX_SCORE));
          setCreamState('happy'); setTimeout(() => setCreamState('idle'), 500);
        }
      }
    }
  };

  const addCheer = (x, y, text, force) => {
    const id = Date.now() + Math.random();
    const img = getCheerleaderImage();
    const newCheer = { id, img, text, x, y };
    setCheers(prev => [...prev, newCheer]);
    setTimeout(() => setCheers(prev => prev.filter(c => c.id !== id)), 4000);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 200); };

  // --- Handlers ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') handleAction('left');
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') handleAction('right');
      if (e.code === 'Space' && heartActiveRef.current) {
        e.preventDefault();
        handleAction('space');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onLeftBtn = (e) => { e.preventDefault(); handleAction('left'); };
  const onRightBtn = (e) => { e.preventDefault(); handleAction('right'); };

  // --- RENDER ---
  if (gameState === 'onboarding') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg)', padding: '20px' }}>
        <h1 style={{ color: '#FF8BA7', fontSize: '2.5rem', marginBottom: '1rem' }}>Kitty Sync V2</h1>
        <p style={{ marginBottom: '1rem' }}>Select your cats and start!</p>

        {/* V2: Player Name Input */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5D4037', display: 'block', marginBottom: '10px' }}>YOUR NAME</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            style={{ padding: '12px 20px', fontSize: '1.1rem', borderRadius: '10px', border: '2px solid #FFD93D', width: '300px', textAlign: 'center', fontWeight: 'bold' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
          {/* LEFT CAT SETUP */}
          <div className="cat-selector">
            <div className="cat-label">LEFT CAT (A)</div>
            <div className="cat-preview">
              <Cat type={catSkins.ginger} position="0" state="idle" />
            </div>
            <div className="controls">
              <button className="arrow-btn" onClick={() => cycleSkin('ginger', -1)}>⬅️</button>
              <span className="skin-name">{catSkins.ginger}</span>
              <button className="arrow-btn" onClick={() => cycleSkin('ginger', 1)}>➡️</button>
            </div>
            <input type="text" placeholder="Name" value={tempNames.ginger} onChange={e => setTempNames({ ...tempNames, ginger: e.target.value })} className="name-input" />
          </div>

          {/* RIGHT CAT SETUP */}
          <div className="cat-selector">
            <div className="cat-label">RIGHT CAT (D)</div>
            <div className="cat-preview">
              <Cat type={catSkins.cream} position="0" state="idle" />
            </div>
            <div className="controls">
              <button className="arrow-btn" onClick={() => cycleSkin('cream', -1)}>⬅️</button>
              <span className="skin-name">{catSkins.cream}</span>
              <button className="arrow-btn" onClick={() => cycleSkin('cream', 1)}>➡️</button>
            </div>
            <input type="text" placeholder="Name" value={tempNames.cream} onChange={e => setTempNames({ ...tempNames, cream: e.target.value })} className="name-input" />
          </div>
        </div>

        <button onClick={startGame} className="start-btn">START GAME</button>

        <style>{`
                .cat-selector {
                    display: flex; flexDirection: column; alignItems: center;
                    background: white; padding: 20px; borderRadius: 20px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .cat-label { marginBottom: 10px; fontWeight: bold; color: #5D4037; letter-spacing: 1px; }
                .cat-preview {
                    width: 120px; height: 120px; marginBottom: 15px;
                    display: flex; justifyContent: center; alignItems: center;
                    transform: scale(1); transition: transform 0.2s;
                }
                .cat-selector:hover .cat-preview { transform: scale(1.1); }
                .controls { display: flex; align-items: center; gap: 10px; marginBottom: 15px; }
                .arrow-btn {
                    background: #f0f0f0; border: none; font-size: 1.2rem; cursor: pointer;
                    width: 40px; height: 40px; borderRadius: 50%;
                    transition: background 0.2s, transform 0.1s;
                }
                .arrow-btn:hover { background: #e0e0e0; transform: scale(1.1); }
                .skin-name { font-weight: bold; color: #888; text-transform: uppercase; font-size: 0.9rem; width: 60px; text-align: center; }
                .name-input {
                    padding: 10px; border: 2px solid #eee; borderRadius: 10px;
                    text-align: center; font-size: 1rem; color: #555; width: 140px;
                }
                .name-input:focus { outline: none; border-color: #FF8BA7; }
                .start-btn {
                    padding: 15px 50px; fontSize: 1.5rem; background: #FF8BA7;
                    color: white; border: none; borderRadius: 50px; cursor: pointer;
                    box-shadow: 0 5px 15px rgba(255,139,167,0.4);
                    transition: all 0.2s;
                }
                .start-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(255,139,167,0.6); }
                .start-btn:active { transform: translateY(1px); }
            `}</style>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg)' }}>
        <h1 style={{ color: '#FFD93D', fontSize: '3rem', textShadow: '3px 3px 0 #333' }}>VICTORY!</h1>
        <div style={{ fontSize: '2rem', marginBottom: '10px', fontFamily: 'monospace' }}>SCORE: {score}</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#555' }}>Player: <b>{playerName}</b></div>

        <div style={{ position: 'relative', width: '300px', height: '200px' }}>
          <Cat type={catSkins.ginger} position="35%" state="happy" />
          <Cat type={catSkins.cream} position="65%" state="happy" />
          <svg style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', overflow: 'visible' }}>
            <path d="M50,90 C10,50 -10,20 25,5 S50,40 50,40 S75,-5 110,5 S90,50 50,90" fill="#FF8BA7" />
          </svg>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button id="save-btn" onClick={handleSaveScore} style={{ padding: '15px 30px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem', marginBottom: '15px' }}>
            📧 EMAIL SCORE TO ME
          </button>
          <br />
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '15px 30px', background: ' #FFD93D', color: '#333', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>PLAY AGAIN</button>
        </div>
      </div>
    );
  }

  // V2: GAME OVER SCREEN
  if (gameState === 'gameover') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h1 style={{ color: '#ff6b6b', fontSize: '4rem', textShadow: '4px 4px 0 #000', margin: 0 }}>GAME OVER</h1>
        <div style={{ fontSize: '2rem', marginTop: '20px', marginBottom: '10px', fontFamily: 'monospace', color: 'white' }}>FINAL SCORE: {score}</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#ddd' }}>Player: <b>{playerName}</b></div>
        <div style={{ fontSize: '1rem', marginTop: '10px', color: '#b3e5fc' }}>📧 Score sent to admin automatically</div>

        <button onClick={() => window.location.reload()} style={{ marginTop: '30px', padding: '15px 40px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem' }}>TRY AGAIN</button>
      </div>
    );
  }

  return (
    <div className={`game-container ${shake ? 'shake' : ''}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* V2 HUD */}
      <div style={{ position: 'absolute', top: 10, width: '100%', textAlign: 'center', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.8)', padding: '5px 20px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>SCORE: {score}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#666' }}>LEVEL: {level}</div>
        </div>

        <h1 style={{ margin: '10px 0 0 0', color: '#5D4037', fontSize: '1.5rem' }}>SYNC METER</h1>
        <div style={{ width: '60%', height: '20px', background: '#ddd', margin: '5px auto', borderRadius: '10px', overflow: 'hidden', border: '2px solid #5D4037' }}>
          <div style={{ height: '100%', width: `${((gingerProgress + creamProgress) / (MAX_SCORE * 2)) * 100}%`, background: 'linear-gradient(90deg, #FFB38A, #FDF0D5)', transition: 'width 0.2s', position: 'relative' }}>
          </div>
        </div>
        {finalHeartActive && (
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: '#FF0000', fontWeight: 'bold', fontSize: '2rem', textShadow: '2px 2px white',
            animation: 'pulse 0.5s infinite', pointerEvents: 'none', zIndex: 200, textAlign: 'center'
          }}>
            FINAL JUMP! <br /> CATCH HEART TOGETHER!
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        {targets.map(t => (
          <Target key={t.id} type={t.type} x={`${t.x}%`} y={`${t.y}%`} rotation={t.rotation} />
        ))}

        <div style={{
          position: 'absolute',
          left: `${gingerPos}%`,
          bottom: '15%',
          transform: 'translateX(-50%)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <Cat type={catSkins.ginger} position="0" state={gingerState} />
        </div>

        <div style={{
          position: 'absolute',
          left: `${creamPos}%`,
          bottom: '15%',
          transform: 'translateX(-50%)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <Cat type={catSkins.cream} position="0" state={creamState} />
        </div>

        <CheerleaderSystem cheers={cheers} />
      </div>

      <div style={{ position: 'absolute', bottom: 20, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onPointerDown={onLeftBtn} className="control-btn" style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#FFB38A', border: '4px solid white', fontSize: '0.9rem', fontWeight: 'bold', color: 'white', boxShadow: '0 5px 0 #C4765A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {catNames.ginger} <span style={{ fontSize: '1.3rem', fontWeight: '900' }}>(A)</span>
          </button>
          <div style={{ marginTop: '10px', fontSize: '1.5rem' }}>
            {Array.from({ length: gingerLives }).map((_, i) => <span key={i}>❤️</span>)} {gingerLives === 0 && '💀'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onPointerDown={onRightBtn} className="control-btn" style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#FDF0D5', border: '4px solid white', fontSize: '0.9rem', fontWeight: 'bold', color: '#5D4037', boxShadow: '0 5px 0 #C4AA7A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {catNames.cream} <span style={{ fontSize: '1.3rem', fontWeight: '900' }}>(D)</span>
          </button>
          <div style={{ marginTop: '10px', fontSize: '1.5rem' }}>
            {Array.from({ length: creamLives }).map((_, i) => <span key={i}>❤️</span>)} {creamLives === 0 && '💀'}
          </div>
        </div>
      </div>

      <style>{`
        .control-btn:active { transform: translateY(5px); box-shadow: 0 0 0 transparent; }
        .shake { animation: shake-anim 0.2s; }
        @keyframes shake-anim { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

export default App;
