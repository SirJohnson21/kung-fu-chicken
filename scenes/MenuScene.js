import Phaser from "phaser"

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene")
    }

    create() {
        this.add.text(320, 220, "KUNG FU CHICKEN", {
            fontSize: "48px",
            color: "#ffffff"
        })

        this.add.text(350, 300, "Press SPACE to Start", {
            fontSize: "28px",
            color: "#ffff00"
        })

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("LevelSelectScene")
        })
    }
}