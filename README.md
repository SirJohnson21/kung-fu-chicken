# Kung Fu Chicken

A 2D platformer game built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/). Play as a kung fu chicken collecting eggs, kicking enemies, and spreading office positivity!

## How to Play

### Controls
| Action | Key |
|--------|-----|
| Move | Arrow keys (← →) |
| Jump | Up arrow |
| Kick | X |
| Shoot (Level 3) | Space |

### Game Flow
- **Menu** → Press **SPACE** to start
- **Level 1** → Collect 3 eggs while avoiding the enemy. Kick with **X** to push enemies away (face them first!).
- **Level 2 (Office Positivity)** → Collect 3 motivational quotes and 1 egg on the desk. Same kick mechanic.
- **Level 3 (Egg Hoop!)** → Bonus basketball mini-game. Shoot eggs through the hoop — make 3 shots to win!

### Tips
- Don't touch enemies unless you're kicking — contact = game over (level restart).
- Level 2 has platforms; jump on the desk to reach the egg.
- In Level 3, the chicken shoots eggs with SPACE; aim with movement before shooting.

## Tech Stack

- **Phaser 3** – Game framework
- **Vite** – Build tool and dev server
- **JavaScript** (ES modules)

## Project Structure

```
KungFuChicken/
├── assets/           # Images and audio
│   ├── chicken.png   # Player spritesheet
│   ├── egg.png       # Collectible
│   ├── enemy.png     # Hazard
│   ├── egg-collect.mp3
│   ├── kick.mp3
│   ├── hit.mp3
│   ├── win.mp3
│   └── quote.mp3
├── scenes/
│   ├── MenuScene.js      # Title screen
│   ├── Level1Scene.js    # Egg collection + enemy
│   ├── Level2Scene.js    # Office quotes + egg
│   ├── Level2WinScene.js # Level 2 victory
│   ├── Level3Scene.js    # Egg hoop mini-game
│   └── WinScene.js       # Level 1 victory
├── main.js           # Phaser config & scene registration
├── index.html
└── package.json
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Setup
```bash
npm install
npm run dev
```

Then open the local URL in your browser (typically `http://localhost:5173`).

### Build for Production
```bash
npx vite build
```

Output goes to the `dist/` folder. Serve it with any static file server.

## License

ISC
