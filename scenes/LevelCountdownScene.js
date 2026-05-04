import Phaser from "phaser"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"

/** Title + body shown before SPACE; body matches each level’s in-game hint line(s). */
const LEVEL_INTROS = {
    TutorialScene: {
        title: "Tutorial — How to move & kick",
        body: "Practice below on the next screen. Arrow keys move, UP jumps, X kicks — face the way you kick. ESC opens level select."
    },
    Level1Scene: {
        title: "Level 1",
        body: "Arrow keys to move | UP to jump | X to kick | ESC — level select"
    },
    Level2Scene: {
        title: "Level 2 — Office positivity",
        body: "Collect quotes and eggs | Avoid stress | X kick | ESC — level select"
    },
    Level3Scene: {
        title: "Level 3 — Egg Hoop bonus",
        body: "Move with arrows | UP to jump | SPACE to shoot | ESC — level select"
    },
    Level4Scene: {
        title: "Level 4 — Sumo-ring positivity",
        body: "Collect 15 positivity (eggs) • Avoid stress • X kick • ESC — level select"
    },
    Level5Scene: {
        title: "Level 5 — Subway platform",
        body: "Move & jump | X to kick bad thoughts | ESC — level select"
    },
    Level6Scene: {
        title: "Level 6 — Flow of hope",
        body: "↑ ↓ steer through each ring — ESC — level select"
    },
    Level7Scene: {
        title: "Level 7 — The Big Doubt",
        body: "Kick doubts into the boss — don’t get hit — ESC — level select"
    }
}

export default class LevelCountdownScene extends Phaser.Scene {
    constructor() {
        super("LevelCountdownScene")
    }

    init(data) {
        this.nextSceneKey = data?.next || "Level1Scene"
    }

    create() {
        this.aborted = false
        this.phase = "intro"
        this.cameras.main.setBackgroundColor("#0f0f14")

        this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.55).setDepth(0)

        const copy = LEVEL_INTROS[this.nextSceneKey] || {
            title: this.nextSceneKey,
            body: "Arrow keys move | UP jumps | X kicks | ESC — level select"
        }

        this.introTitle = this.add
            .text(500, 88, copy.title, {
                fontSize: "30px",
                color: "#f0e8ff",
                align: "center",
                wordWrap: { width: 900 }
            })
            .setOrigin(0.5, 0)
            .setDepth(1)

        this.introBody = this.add
            .text(500, 138, copy.body, {
                fontSize: "20px",
                color: "#c8c0e0",
                align: "center",
                wordWrap: { width: 900 }
            })
            .setOrigin(0.5, 0)
            .setDepth(1)

        this.spaceHint = this.add
            .text(500, 468, "Press SPACE to begin", {
                fontSize: "26px",
                color: "#9cf6e8"
            })
            .setOrigin(0.5)
            .setDepth(1)

        this.tweens.add({
            targets: this.spaceHint,
            alpha: { from: 0.45, to: 1 },
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.counterText = this.add
            .text(500, 300, "5", {
                fontSize: "140px",
                color: "#ffffff"
            })
            .setOrigin(0.5)
            .setDepth(1)
            .setVisible(false)

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        registerEscToLevelSelect(this)
    }

    beginCountdown() {
        if (this.aborted || this.phase !== "intro") return
        this.phase = "countdown"

        this.introTitle.setVisible(false)
        this.introBody.setVisible(false)
        this.spaceHint.setVisible(false)

        this.counterText.setVisible(true)
        this.counterText.setAlpha(1)
        this.counterText.setScale(1)

        this.tweens.add({
            targets: this.counterText,
            scale: { from: 0.92, to: 1.08 },
            duration: 450,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        let remaining = 5
        const tick = () => {
            if (this.aborted) return
            if (remaining <= 0) {
                this.scene.start(this.nextSceneKey)
                return
            }
            this.counterText.setText(String(remaining))
            remaining -= 1
            this.time.delayedCall(1000, tick)
        }
        tick()
    }

    update() {
        if (goToLevelSelectIfEsc(this)) {
            this.aborted = true
            this.time.removeAllEvents()
            return
        }

        if (this.phase === "intro" && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.beginCountdown()
        }
    }
}
