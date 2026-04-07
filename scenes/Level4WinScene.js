import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"

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
        this.cameras.main.setBackgroundColor("#040016")

        // Scanlines + subtle grid (cheap Atari effect)
        this.drawAtariBackground()

        this.add
            .text(500, 110, "POSITIVITY OVERFLOW!", {
                fontSize: "48px",
                color: "#00ffcc"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 190, "You kept the vibe clean. Kick the stress!"
                , {
                    fontSize: "26px",
                    color: "#b7fff1"
                })
            .setOrigin(0.5)

        this.add
            .text(500, 520, "Press SPACE for Level 5", {
                fontSize: "24px",
                color: "#eaffff"
            })
            .setOrigin(0.5)

        // Dancing chicken (reuse earlier looping frames)
        this.chicken = this.add.sprite(500, 340, "chicken", 1)
        this.chicken.setScale(1.2)

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

        // Neon positivity orbs (small eggs tinted green)
        this.positivity = []
        for (let i = 0; i < 14; i++) {
            const orb = this.add.image(500, 290, "egg")
            orb.setScale(0.02)
            orb.setTint(0x00ff88)
            orb.setAlpha(0.95)
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
                    0x00ffcc,
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
            this.scene.start("Level5Scene")
        })
    }

    drawAtariBackground() {
        const width = 1000
        const height = 600

        const grid = this.add.graphics()
        grid.lineStyle(1, 0x10255a, 0.35)

        for (let x = 0; x <= width; x += 50) {
            grid.beginPath()
            grid.moveTo(x, 0)
            grid.lineTo(x, height)
            grid.strokePath()
        }

        for (let y = 0; y <= height; y += 50) {
            grid.beginPath()
            grid.moveTo(0, y)
            grid.lineTo(width, y)
            grid.strokePath()
        }

        const scan = this.add.graphics()
        scan.fillStyle(0x000000, 0.14)
        for (let y = 0; y < height; y += 4) {
            scan.fillRect(0, y, width, 1)
        }
    }
}

