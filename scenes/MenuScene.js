import Phaser from "phaser"

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene")
    }

    create() {
        this.add
            .text(500, 220, "KUNG FU CHICKEN", {
                fontSize: "48px",
                color: "#ffffff"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 300, "Press SPACE — how are you feeling? Then level select.", {
                fontSize: "20px",
                color: "#ffff00"
            })
            .setOrigin(0.5)

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("FeelingScene")
        })
    }
}