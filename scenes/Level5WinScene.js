import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import level5ThoughtUrl from "../assets/level5.png?url"
import { startLevelWithCountdown } from "../utils/startLevelWithCountdown.js"

export default class Level5WinScene extends Phaser.Scene {
    constructor() {
        super("Level5WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.image("level5Thought", level5ThoughtUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#0f1218")

        for (let i = 0; i < 14; i++) {
            const x = Phaser.Math.Between(30, 970)
            const y = Phaser.Math.Between(60, 540)
            const ghost = this.add.image(x, y, "level5Thought")
            ghost.setScale(Phaser.Math.FloatBetween(0.035, 0.085))
            ghost.setAlpha(Phaser.Math.FloatBetween(0.1, 0.26))
            ghost.setTint(0xaaa0c8)
            ghost.setDepth(0)
            ghost.setAngle(Phaser.Math.Between(-25, 25))

            this.tweens.add({
                targets: ghost,
                x: x + Phaser.Math.Between(-40, 40),
                y: y + Phaser.Math.Between(-35, 35),
                angle: ghost.angle + Phaser.Math.Between(-15, 15),
                duration: Phaser.Math.Between(5000, 10000),
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            })
        }

        this.add
            .text(500, 160, "MIND CLEAR!", {
                fontSize: "46px",
                color: "#fef9c3",
                stroke: "#0f172a",
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setDepth(50)

        this.add
            .text(500, 240, "Those heavy thoughts didn’t stick.", {
                fontSize: "26px",
                color: "#e2e8f0",
                stroke: "#0f172a",
                strokeThickness: 3
            })
            .setOrigin(0.5)
            .setDepth(50)

        this.chicken = this.add.sprite(500, 380, "chicken", 3)
        this.chicken.setScale(1.15)
        this.chicken.setDepth(100)

        this.anims.create({
            key: "win5Nervous",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
            repeat: -1
        })
        this.chicken.play("win5Nervous")

        this.tweens.add({
            targets: this.chicken,
            angle: 7,
            duration: 110,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: this.chicken,
            y: 372,
            duration: 160,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: this.chicken,
            x: 496,
            duration: 95,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.add
            .text(500, 510, "Press SPACE for Level 6 — Flow of Hope", {
                fontSize: "22px",
                color: "#cbd5e1",
                stroke: "#0f172a",
                strokeThickness: 3
            })
            .setOrigin(0.5)
            .setDepth(150)

        this.input.keyboard.once("keydown-SPACE", () => {
            startLevelWithCountdown(this, "Level6Scene")
        })
    }
}
