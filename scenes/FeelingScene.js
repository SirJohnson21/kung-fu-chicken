import Phaser from "phaser"
import { FEELING_MOODS, preloadFeelingMoodImages, getFeelingIconScale } from "../utils/feelingMoods.js"

const ICON_SELECTED_MULT = 1.12

export default class FeelingScene extends Phaser.Scene {
    constructor() {
        super("FeelingScene")
    }

    preload() {
        preloadFeelingMoodImages(this)
    }

    create() {
        this.cameras.main.setBackgroundColor("#1a1625")

        this.add
            .text(500, 70, "HOW ARE YOU FEELING?", {
                fontSize: "36px",
                color: "#e8e0ff"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 118, "↑ ↓ choose   ·   1–4 jump   ·   SPACE or ENTER — continue   ·   ESC — title", {
                fontSize: "17px",
                color: "#a8a0c0"
            })
            .setOrigin(0.5)

        this.selectedIndex = 0
        this.rows = []

        const startY = 168
        const rowH = 52

        FEELING_MOODS.forEach((m, i) => {
            const y = startY + i * rowH
            const container = this.add.container(500, y)

            const bg = this.add
                .rectangle(0, 0, 640, 48, 0x2a2840)
                .setStrokeStyle(2, 0x4a4570)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => {
                    if (this.selectedIndex !== i) bg.setFillStyle(0x323050)
                })
                .on("pointerout", () => this.refreshSelectionHighlight())
                .on("pointerdown", () => {
                    this.selectedIndex = i
                    this.refreshSelectionHighlight()
                })

            const icon = this.add.image(-268, 0, m.textureKey).setOrigin(0.5, 0.5)
            const iconBaseScale = getFeelingIconScale(icon)
            icon.setScale(iconBaseScale)

            const title = this.add
                .text(-168, 0, m.label, {
                    fontSize: "24px",
                    color: "#ffffff"
                })
                .setOrigin(0, 0.5)

            const blurb = this.add
                .text(8, 0, m.blurb, {
                    fontSize: "18px",
                    color: "#c4b8e0"
                })
                .setOrigin(0, 0.5)

            container.add([bg, icon, title, blurb])
            this.rows.push({ container, bg, title, blurb, icon, iconBaseScale })
        })

        this.cursors = this.input.keyboard.createCursorKeys()
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

        const codes = [
            Phaser.Input.Keyboard.KeyCodes.ONE,
            Phaser.Input.Keyboard.KeyCodes.TWO,
            Phaser.Input.Keyboard.KeyCodes.THREE,
            Phaser.Input.Keyboard.KeyCodes.FOUR
        ]
        codes.forEach((code, i) => {
            this.input.keyboard.addKey(code).on("down", () => {
                this.selectedIndex = i
                this.refreshSelectionHighlight()
            })
        })

        this.refreshSelectionHighlight()
    }

    refreshSelectionHighlight() {
        this.rows.forEach((row, i) => {
            const on = i === this.selectedIndex
            row.bg.setFillStyle(on ? 0x3d3a62 : 0x2a2840)
            row.bg.setStrokeStyle(2, on ? 0xd4c4ff : 0x4a4570)
            row.title.setColor(on ? "#fffef8" : "#ffffff")
            row.blurb.setColor(on ? "#e8e0ff" : "#c4b8e0")
            row.icon.setScale(row.iconBaseScale * (on ? ICON_SELECTED_MULT : 1))
        })
    }

    confirmAndGo() {
        const mood = FEELING_MOODS[this.selectedIndex]
        this.registry.set("moodBefore", mood.id)
        this.scene.start("LevelSelectScene")
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.start("MenuScene")
            return
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.selectedIndex = (this.selectedIndex + FEELING_MOODS.length - 1) % FEELING_MOODS.length
            this.refreshSelectionHighlight()
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.selectedIndex = (this.selectedIndex + 1) % FEELING_MOODS.length
            this.refreshSelectionHighlight()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.confirmAndGo()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.confirmAndGo()
        }
    }
}
