import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { startLevelWithCountdown } from "../utils/startLevelWithCountdown.js"

export default class Level6WinScene extends Phaser.Scene {
    constructor() {
        super("Level6WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
    }

    create() {
        this.cameras.main.setBackgroundColor("#c8e9ff")

        this.add.rectangle(500, 200, 1000, 400, 0xa8d8ff).setDepth(0)
        this.add.rectangle(500, 480, 1000, 280, 0xd9f0ff).setDepth(0)
        this.add.circle(820, 90, 52, 0xfffdf5, 0.98).setDepth(1)

        this.add
            .text(500, 150, "IN THE FLOW", {
                fontSize: "44px",
                color: "#0f4a6e"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 220, "Hope and peace — ring after ring.", {
                fontSize: "24px",
                color: "#2d5580"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.chicken = this.add.sprite(500, 360, "chicken", 1)
        this.chicken.setScale(1.1)
        this.chicken.setDepth(20)

        this.anims.create({
            key: "win6dance",
            frames: [0, 1, 2, 1].map((frame) => ({ key: "chicken", frame })),
            frameRate: 10,
            repeat: -1
        })
        this.chicken.play("win6dance")

        this.tweens.add({
            targets: this.chicken,
            y: 340,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.add
            .text(500, 500, "Press SPACE for Level 7 — The Big Doubt", {
                fontSize: "22px",
                color: "#1a5f8a"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.input.keyboard.once("keydown-SPACE", () => {
            startLevelWithCountdown(this, "Level7Scene")
        })
    }
}
