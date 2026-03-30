import Phaser from "phaser"
import { addBasketballHoopVisual } from "../utils/basketballHoop.js"

export default class Level3WinScene extends Phaser.Scene {
    constructor() {
        super("Level3WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.image("egg", "assets/egg.png")
    }

    create() {
        this.cameras.main.setBackgroundColor("#87ceeb")

        // Court (matches bonus level look)
        this.add.rectangle(500, 570, 1000, 60, 0x8b5a2b)
        this.add.rectangle(500, 540, 1000, 4, 0xffffff)

        addBasketballHoopVisual(this)

        this.add.text(500, 65, "NOTHING BUT NET!", {
            fontSize: "42px",
            color: "#1a1a1a"
        }).setOrigin(0.5)

        this.add.text(500, 118, "Cluck Jordan with the jumper!", {
            fontSize: "26px",
            color: "#333333"
        }).setOrigin(0.5)

        this.add.text(500, 505, "Press SPACE for Level 4", {
            fontSize: "24px",
            color: "#222222"
        }).setOrigin(0.5)

        const cx = 330
        const groundY = 398
        const peakY = 268

        this.chicken = this.add.sprite(cx, groundY, "chicken", 3)
        this.chicken.setScale(1.0)
        this.chicken.setFlipX(false)
        this.chicken.setAngle(-14)

        this.anims.create({
            key: "jumpshotFlap",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 8,
            repeat: -1
        })
        this.chicken.play("jumpshotFlap")

        this.ball = this.add.image(cx + 42, groundY - 32, "egg")
        this.ball.setScale(0.085)

        this.swishBurst = this.add.circle(800, 320, 22, 0xffffdd, 0.85)
        this.swishBurst.setVisible(false)

        const playJumpShot = () => {
            this.tweens.killTweensOf([this.chicken, this.ball, this.swishBurst])

            this.chicken.setPosition(cx, groundY)
            this.chicken.setAngle(-17)
            this.chicken.setAlpha(1)

            this.ball.setPosition(cx + 40, groundY - 28)
            this.ball.setScale(0.085)
            this.ball.setAlpha(1)

            this.swishBurst.setVisible(false)
            this.swishBurst.setScale(0.3)
            this.swishBurst.setAlpha(0.9)

            this.tweens.add({
                targets: this.chicken,
                y: peakY,
                angle: -6,
                duration: 380,
                ease: "Sine.out",
                onComplete: () => {
                    this.tweens.add({
                        targets: this.chicken,
                        y: groundY,
                        angle: -14,
                        duration: 520,
                        ease: "Sine.in"
                    })
                }
            })

            this.tweens.add({
                targets: this.ball,
                x: 800,
                y: 322,
                scale: 0.05,
                duration: 580,
                delay: 260,
                ease: "Quad.out",
                onComplete: () => {
                    this.swishBurst.setVisible(true)
                    this.tweens.add({
                        targets: this.swishBurst,
                        scale: 1.35,
                        alpha: 0,
                        duration: 220,
                        ease: "Cubic.out",
                        onComplete: () => {
                            this.swishBurst.setVisible(false)
                        }
                    })
                    this.tweens.add({
                        targets: this.ball,
                        alpha: 0,
                        duration: 160,
                        delay: 80
                    })
                }
            })

            this.time.delayedCall(1500, playJumpShot)
        }

        playJumpShot()

        // SPACE is also the Level 3 shoot key — avoid missing the next press if it was
        // still held when this scene started; wait a beat then use JustDown.
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.canGoToLevel4 = false
        this.time.delayedCall(400, () => {
            this.canGoToLevel4 = true
        })
    }

    update() {
        if (
            this.canGoToLevel4 &&
            Phaser.Input.Keyboard.JustDown(this.spaceKey)
        ) {
            this.scene.start("Level4Scene")
        }
    }
}
