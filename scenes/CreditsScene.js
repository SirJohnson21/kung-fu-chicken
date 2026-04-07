import Phaser from "phaser"

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super("CreditsScene")
    }

    create() {
        this.cameras.main.setBackgroundColor("#0c0a12")

        this.add.rectangle(500, 300, 1000, 600, 0x15101f).setDepth(0)

        this.add
            .text(500, 160, "KUNG FU CHICKEN", {
                fontSize: "42px",
                color: "#f5f0ff"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 248, "brought to you by", {
                fontSize: "22px",
                color: "#9ca3af"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 310, "B+", {
                fontSize: "56px",
                color: "#c4b5fd"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 378, "Be Positive Productions", {
                fontSize: "26px",
                color: "#a78bfa"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 510, "Press SPACE — title screen", {
                fontSize: "22px",
                color: "#6b7280"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("MenuScene")
        })
    }
}
