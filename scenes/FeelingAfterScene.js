import Phaser from "phaser"
import {
    FEELING_MOODS,
    preloadFeelingMoodImages,
    getFeelingIconScaleInBox
} from "../utils/feelingMoods.js"
import { MOOD_GRID, getMoodCellCenters, nextMoodGridIndex } from "../utils/feelingMoodGrid.js"

const ICON_SELECTED_MULT = 1.05

export default class FeelingAfterScene extends Phaser.Scene {
    constructor() {
        super("FeelingAfterScene")
    }

    preload() {
        preloadFeelingMoodImages(this)
    }

    create() {
        this.cameras.main.setBackgroundColor("#0f172a")

        this.add
            .text(500, 28, "HOW DO YOU FEEL AFTER THE GAME?", {
                fontSize: "22px",
                color: "#c7d2fe",
                wordWrap: { width: 960 },
                align: "center"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 82, "Pick a box  ·  arrows  ·  1–4  ·  SPACE / ENTER  ·  ESC — skip", {
                fontSize: "13px",
                color: "#94a3b8",
                wordWrap: { width: 960 },
                align: "center"
            })
            .setOrigin(0.5)

        this.selectedIndex = 0
        this.rows = []

        const centers = getMoodCellCenters(112)
        const { cellW, cellH } = MOOD_GRID
        const iconMaxW = cellW - 28
        const iconMaxH = 112

        FEELING_MOODS.forEach((m, i) => {
            const { x, y } = centers[i]
            const container = this.add.container(x, y)

            const bg = this.add
                .rectangle(0, 0, cellW, cellH, 0x1e293b)
                .setStrokeStyle(2, 0x475569)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => {
                    if (this.selectedIndex !== i) bg.setFillStyle(0x273549)
                })
                .on("pointerout", () => this.refreshSelectionHighlight())
                .on("pointerdown", () => {
                    this.selectedIndex = i
                    this.refreshSelectionHighlight()
                })

            const icon = this.add.image(0, -54, m.textureKey).setOrigin(0.5, 0.5)
            const iconBaseScale = getFeelingIconScaleInBox(icon, iconMaxW, iconMaxH)
            icon.setScale(iconBaseScale)

            const title = this.add
                .text(0, 34, m.label, {
                    fontSize: "19px",
                    color: "#f1f5f9"
                })
                .setOrigin(0.5, 0.5)

            const blurb = this.add
                .text(0, 62, m.blurb, {
                    fontSize: "13px",
                    color: "#94a3b8",
                    align: "center",
                    wordWrap: { width: cellW - 28 }
                })
                .setOrigin(0.5, 0)

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
            row.bg.setFillStyle(on ? 0x334155 : 0x1e293b)
            row.bg.setStrokeStyle(3, on ? 0xa78bfa : 0x475569)
            row.title.setColor(on ? "#ffffff" : "#f1f5f9")
            row.blurb.setColor(on ? "#e2e8f0" : "#94a3b8")
            row.icon.setScale(row.iconBaseScale * (on ? ICON_SELECTED_MULT : 1))
        })
    }

    confirmAndGo() {
        const mood = FEELING_MOODS[this.selectedIndex]
        this.registry.set("moodAfter", mood.id)
        this.scene.start("MenuScene")
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.start("MenuScene")
            return
        }

        const next = nextMoodGridIndex(
            this.selectedIndex,
            Phaser.Input.Keyboard.JustDown(this.cursors.up),
            Phaser.Input.Keyboard.JustDown(this.cursors.down),
            Phaser.Input.Keyboard.JustDown(this.cursors.left),
            Phaser.Input.Keyboard.JustDown(this.cursors.right)
        )
        if (next !== this.selectedIndex) {
            this.selectedIndex = next
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
