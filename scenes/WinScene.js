import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { startLevelWithCountdown } from "../utils/startLevelWithCountdown.js"

export default class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })

        this.load.image("egg", assetUrl("assets/egg.png"))
    }

    create() {
        this.cameras.main.setBackgroundColor("#1b1b2f")

        this.add.text(250, 120, "WHAT THE CLUCK?!", {
            fontSize: "48px",
            color: "#ffff00"
        })

        this.add.text(360, 200, "You did it!", {
            fontSize: "36px",
            color: "#ffffff"
        })

        this.add.text(285, 500, "Press SPACE to continue", {
            fontSize: "24px",
            color: "#ffffff"
        })

        // Dancing chicken
        this.chicken = this.add.sprite(500, 330, "chicken", 1)
        this.chicken.setScale(1.2)

        this.anims.create({
            key: "dance",
            frames: [0, 1, 2, 1].map((frame) => ({ key: "chicken", frame })),
            frameRate: 12,
            repeat: -1
        })

        this.chicken.play("dance")

        this.tweens.add({
            targets: this.chicken,
            x: 540,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: this.chicken,
            y: 310,
            duration: 150,
            yoyo: true,
            repeat: -1
        })

        this.tweens.add({
            targets: this.chicken,
            angle: 10,
            duration: 150,
            yoyo: true,
            repeat: -1
        })

        // Confetti circles
        this.confettiGroup = []

        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 1000)
            const y = Phaser.Math.Between(-600, -20)
            const size = Phaser.Math.Between(4, 10)

            const confetti = this.add.circle(
                x,
                y,
                size,
                Phaser.Display.Color.RandomRGB().color
            )

            this.confettiGroup.push(confetti)

            this.tweens.add({
                targets: confetti,
                y: 700,
                x: x + Phaser.Math.Between(-80, 80),
                angle: Phaser.Math.Between(90, 360),
                duration: Phaser.Math.Between(1800, 3200),
                repeat: -1,
                delay: Phaser.Math.Between(0, 1200),
                onRepeat: () => {
                    confetti.x = Phaser.Math.Between(0, 1000)
                    confetti.y = Phaser.Math.Between(-300, -50)
                }
            })
        }

        // Egg shower
        this.eggGroup = []

        for (let i = 0; i < 12; i++) {
            const egg = this.add.image(
                Phaser.Math.Between(50, 950),
                Phaser.Math.Between(-800, -50),
                "egg"
            )

            egg.setScale(0.05)
            this.eggGroup.push(egg)

            this.tweens.add({
                targets: egg,
                y: 700,
                angle: 360,
                duration: Phaser.Math.Between(2200, 3500),
                repeat: -1,
                delay: Phaser.Math.Between(0, 1500),
                onRepeat: () => {
                    egg.x = Phaser.Math.Between(50, 950)
                    egg.y = Phaser.Math.Between(-500, -80)
                    egg.angle = 0
                }
            })
        }

        this.input.keyboard.once("keydown-SPACE", () => {
            startLevelWithCountdown(this, "Level2Scene")
        })
    }
}