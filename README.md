# 🎮 Kitty Sync V2 - Valentine's Day Game

A fun rhythm-based catching game where two cats work together to catch good items and avoid bad ones!

## 🎯 Features

- **Dual Cat Control**: Control two cats simultaneously (A and D keys)
- **Scoring System**: Points with level multipliers (1x to 3x)
- **Lives System**: 3 lives per cat, lose 1 on bad items
- **Extra Life Hearts**: Rare catchable hearts restore lives
- **5 Difficulty Levels**: Game speeds up as you progress
- **Auto Email Scores**: Scores automatically sent to admin via EmailJS
- **Cat Customization**: 6 different cat skins to choose from

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📧 EmailJS Configuration

1. Go to https://dashboard.emailjs.com
2. Configure template `template_8cvc3s8`
3. Set "To Email" to your email address
4. Use the HTML template from `EMAIL_SETUP.md`

See `EMAILJS_CONFIG.md` for full setup instructions.

## 🎮 How to Play

1. Enter your name and choose cat names
2. Press START GAME
3. Use **A** key to control left cat
4. Use **D** key to control right cat
5. Catch good items (fish, yarn, milk, etc.)
6. Avoid bad items (spray, cucumber, dog, etc.)
7. Catch rare hearts (❤️) to restore lives!

## 📊 Scoring

- Good items: 10-30 points (based on rarity)
- Level multiplier: 1x → 3x (increases every 300 points)
- Bad items: -20 points + lose 1 life

## 🎨 Items

**Good Items**: fish, yarn, mouse, bird, milk, can, catnip
**Special**: heart (restores 1 life)
**Bad Items**: spray, water, cucumber, cactus, dog, vacuum, thunder, bomb, bee, broom, ghost

## 🏗️ Tech Stack

- React + Vite
- EmailJS for score submission
- CSS animations and effects

## 📝 Files

- `src/App.jsx` - Main game logic
- `src/components/Cat.jsx` - Cat component
- `src/components/Target.jsx` - Falling items
- `src/emailService.js` - EmailJS integration
- `EMAIL_SETUP.md` - Email template
- `EMAILJS_CONFIG.md` - Configuration guide

## 🎉 Version 2 Features

V2 adds:
- Player name input
- Scoring system with levels
- Lives system (3 per cat)
- Auto-send email on game over
- Catchable hearts for extra lives
- Improved validation
- Score/Level HUD display

Enjoy the game! 🐱❤️🐱
