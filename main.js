import Phaser from "phaser"
import MenuScene from "./scenes/MenuScene.js"
import TutorialScene from "./scenes/TutorialScene.js"
import LevelSelectScene from "./scenes/LevelSelectScene.js"
import Level1Scene from "./scenes/Level1Scene.js"
import Level2Scene from "./scenes/Level2Scene.js"
import Level3Scene from "./scenes/Level3Scene.js"
import Level4Scene from "./scenes/Level4Scene.js"
import WinScene from "./scenes/WinScene.js"
import Level2WinScene from "./scenes/Level2WinScene.js"
import Level3WinScene from "./scenes/Level3WinScene.js"
import Level4WinScene from "./scenes/Level4WinScene.js"
import Level5Scene from "./scenes/Level5Scene.js"
import Level5WinScene from "./scenes/Level5WinScene.js"
import Level6Scene from "./scenes/Level6Scene.js"
import Level6WinScene from "./scenes/Level6WinScene.js"
import Level7Scene from "./scenes/Level7Scene.js"
import Level7WinScene from "./scenes/Level7WinScene.js"
import CreditsScene from "./scenes/CreditsScene.js"

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
    scene: [
        MenuScene,
        TutorialScene,
        LevelSelectScene,
        Level1Scene,
        Level2Scene,
        Level3Scene,
        Level4Scene,
        Level5Scene,
        Level6Scene,
        Level7Scene,
        WinScene,
        Level2WinScene,
        Level3WinScene,
        Level4WinScene,
        Level5WinScene,
        Level6WinScene,
        Level7WinScene,
        CreditsScene
    ]
}

new Phaser.Game(config)