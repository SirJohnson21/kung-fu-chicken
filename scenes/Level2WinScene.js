import Phaser from "phaser"

export default class Level2WinScene extends Phaser.Scene {
    constructor() {
        super("Level2WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 256,
            frameHeight: 512
        })
    }

    create() {
        this.cameras.main.setBackgroundColor("#d9e6f2")

        this.add.text(300, 110, "OFFICE SAVED!", {
            fontSize: "48px",
            color: "#222222"
        })

        this.add.text(270, 180, "You spread positivity at work!", {
            fontSize: "30px",
            color: "#444444"
        })

        this.add.text(305, 500, "Press SPACE to continue", {
            fontSize: "24px",
            color: "#222222"
        })

        this.chicken = this.add.sprite(500, 330, "chicken", 2)
        this.chicken.setScale(0.32)

        this.anims.create({
            key: "officeDance",
            frames: this.anims.generateFrameNumbers("chicken", { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        })

        this.chicken.play("officeDance")

        this.tweens.add({
            targets: this.chicken,
            y: 310,
            duration: 180,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: this.chicken,
            x: 535,
            duration: 250,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        // Floating office-style quote cards
        this.quote1 = this.add.rectangle(180, 300, 180, 55, 0xffffff).setStrokeStyle(2, 0x222222)
        this.quoteText1 = this.add.text(180, 300, "Keep going.", {
            fontSize: "20px",
            color: "#222222"
        }).setOrigin(0.5)

        this.quote2 = this.add.rectangle(820, 260, 220, 55, 0xffffff).setStrokeStyle(2, 0x222222)
        this.quoteText2 = this.add.text(820, 260, "Progress beats perfection.", {
            fontSize: "18px",
            color: "#222222"
        }).setOrigin(0.5)

        this.tweens.add({
            targets: [this.quote1, this.quoteText1],
            y: "-=12",
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.tweens.add({
            targets: [this.quote2, this.quoteText2],
            y: "-=10",
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("Level3Scene")
        })
    }
}