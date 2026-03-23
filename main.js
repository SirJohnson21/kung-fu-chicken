import Phaser from "phaser"
import MenuScene from "./scenes/MenuScene.js"
import Level1Scene from "./scenes/Level1Scene.js"
import Level2Scene from "./scenes/Level2Scene.js"
import Level3Scene from "./scenes/Level3Scene.js"
import WinScene from "./scenes/WinScene.js"
import Level2WinScene from "./scenes/Level2WinScene.js"

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: "#222",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: [MenuScene, Level1Scene, Level2Scene, Level3Scene, WinScene, Level2WinScene]
}

new Phaser.Game(config)