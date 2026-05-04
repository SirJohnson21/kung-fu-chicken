import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { startLevelWithCountdown } from "../utils/startLevelWithCountdown.js"
import { addLevel4SumoRingGraphics, addLevel4SumoBannerText } from "../utils/level4SumoBackdrop.js"

export default class Level4WinScene extends Phaser.Scene {
    constructor() {
        super("Level4WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.image("egg", assetUrl("assets/egg.png"))
    }

    create() {
        this.cameras.main.setBackgroundColor("#2a1810")

        addLevel4SumoRingGraphics(this)
        addLevel4SumoBannerText(this, "Victory on the clay")

        this.add
            .text(500, 110, "POSITIVITY OVERFLOW!", {
                fontSize: "48px",
                color: "#fef3c7",
                stroke: "#450a0a",
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 190, "You kept the vibe clean. Kick the stress!", {
                fontSize: "26px",
                color: "#fde68a",
                stroke: "#431407",
                strokeThickness: 3,
                align: "center",
                wordWrap: { width: 720 }
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 520, "Press SPACE for Level 5", {
                fontSize: "24px",
                color: "#fffbeb",
                stroke: "#451a03",
                strokeThickness: 3
            })
            .setOrigin(0.5)
            .setDepth(10)

        // Dancing chicken (reuse earlier looping frames)
        this.chicken = this.add.sprite(500, 340, "chicken", 1)
        this.chicken.setScale(1.2)
        this.chicken.setDepth(12)

        this.anims.create({
            key: "winDance4",
            frames: [0, 1, 2, 1].map((frame) => ({ key: "chicken", frame })),
            frameRate: 12,
            repeat: -1
        })

        this.chicken.play("winDance4")

        this.tweens.add({
            targets: this.chicken,
            y: 300,
            duration: 220,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: this.chicken,
            angle: 8,
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        // Positivity orbs (small eggs tinted green)
        this.positivity = []
        for (let i = 0; i < 14; i++) {
            const orb = this.add.image(500, 290, "egg")
            orb.setScale(0.02)
            orb.setTint(0x4ade80)
            orb.setAlpha(0.95)
            orb.setDepth(11)
            this.positivity.push(orb)

            const angle = Phaser.Math.DegToRad(i * (360 / 14))
            const radius = Phaser.Math.Between(70, 150)
            const dx = Math.cos(angle) * radius
            const dy = Math.sin(angle) * radius

            orb.x = 500 + dx
            orb.y = 290 + dy

            this.tweens.add({
                targets: orb,
                y: orb.y - Phaser.Math.Between(10, 40),
                alpha: 0.3,
                duration: Phaser.Math.Between(900, 1600),
                yoyo: true,
                repeat: -1,
                ease: "Sine.inOut"
            })
        }

        // Tiny burst when scene appears
        this.time.delayedCall(250, () => {
            for (let i = 0; i < 20; i++) {
                const dot = this.add.circle(
                    500,
                    340,
                    Phaser.Math.Between(2, 4),
                    0xfbbf24,
                    0.95
                )
                const a = Phaser.Math.Between(0, 360)
                const v = Phaser.Math.Between(90, 180)
                dot.x += Math.cos(Phaser.Math.DegToRad(a)) * v * 0.02

                this.tweens.add({
                    targets: dot,
                    x: dot.x + Math.cos(Phaser.Math.DegToRad(a)) * v,
                    y: dot.y + Math.sin(Phaser.Math.DegToRad(a)) * v,
                    alpha: 0,
                    duration: Phaser.Math.Between(500, 900),
                    onComplete: () => dot.destroy()
                })
            }
        })

        this.input.keyboard.once("keydown-SPACE", () => {
            startLevelWithCountdown(this, "Level5Scene")
        })
    }

}

