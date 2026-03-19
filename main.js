import Phaser from "phaser"
import MenuScene from "./scenes/MenuScene.js"
import Level1Scene from "./scenes/Level1Scene.js"

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
    scene: [MenuScene, Level1Scene]
}

new Phaser.Game(config)