import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"

export default class Level7WinScene extends Phaser.Scene {
    constructor() {
        super("Level7WinScene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
    }

    create() {
        this.cameras.main.setBackgroundColor("#0f172a")

        this.add.rectangle(500, 300, 1000, 600, 0x1e1b4b).setDepth(0)

        const burst = this.add.circle(500, 280, 200, 0xfbbf24, 0.15).setDepth(1)
        this.tweens.add({
            targets: burst,
            scale: 1.35,
            alpha: 0.22,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.add
            .text(500, 120, "DOUBT DEFEATED", {
                fontSize: "48px",
                color: "#fef3c7"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.add
            .text(500, 188, "You stood your ground. The coop is yours.", {
                fontSize: "24px",
                color: "#c4b5fd"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.chicken = this.add.sprite(500, 360, "chicken", 1)
        this.chicken.setScale(1.25)
        this.chicken.setDepth(20)

        this.anims.create({
            key: "win7celebrate",
            frames: [0, 1, 2, 1].map((frame) => ({ key: "chicken", frame })),
            frameRate: 11,
            repeat: -1
        })
        this.chicken.play("win7celebrate")

        this.tweens.add({
            targets: this.chicken,
            y: 332,
            duration: 450,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.add
            .text(500, 500, "Press SPACE — credits", {
                fontSize: "22px",
                color: "#a5b4fc"
            })
            .setOrigin(0.5)
            .setDepth(10)

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("CreditsScene")
        })
    }
}
