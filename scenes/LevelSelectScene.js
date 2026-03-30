import Phaser from "phaser"

const LEVELS = [
    { key: "Level1Scene", title: "Level 1", blurb: "Eggs & kicks on the farm" },
    { key: "Level2Scene", title: "Level 2", blurb: "Office positivity" },
    { key: "Level3Scene", title: "Level 3", blurb: "Egg Hoop bonus" },
    { key: "Level4Scene", title: "Level 4", blurb: "Atari positivity flow" },
    { key: "Level5Scene", title: "Level 5", blurb: "Kick the bad thoughts" },
    { key: "Level6Scene", title: "Level 6", blurb: "Flow of hope & peace" }
]

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super("LevelSelectScene")
    }

    create() {
        this.cameras.main.setBackgroundColor("#1e1e2e")

        this.add
            .text(500, 70, "CHOOSE A LEVEL", {
                fontSize: "40px",
                color: "#e8e0ff"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 118, "↑ ↓ to select   ·   1–6 to jump in   ·   SPACE or ENTER to play", {
                fontSize: "18px",
                color: "#a8a0c0"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 520, "ESC — back to title", {
                fontSize: "18px",
                color: "#7a7390"
            })
            .setOrigin(0.5)

        this.selectedIndex = 0
        this.rows = []

        const startY = 175
        const rowH = 52

        LEVELS.forEach((lvl, i) => {
            const y = startY + i * rowH
            const container = this.add.container(500, y)

            const bg = this.add
                .rectangle(0, 0, 720, 46, 0x2a2840)
                .setStrokeStyle(2, 0x4a4570)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => {
                    if (this.selectedIndex !== i) {
                        bg.setFillStyle(0x323050)
                    }
                })
                .on("pointerout", () => {
                    this.refreshSelectionHighlight()
                })
                .on("pointerdown", () => {
                    this.selectedIndex = i
                    this.refreshSelectionHighlight()
                    this.startLevel(i)
                })

            const title = this.add
                .text(-330, 0, lvl.title, {
                    fontSize: "22px",
                    color: "#ffffff"
                })
                .setOrigin(0, 0.5)

            const blurb = this.add
                .text(-180, 0, lvl.blurb, {
                    fontSize: "18px",
                    color: "#c4b8e0"
                })
                .setOrigin(0, 0.5)

            container.add([bg, title, blurb])
            this.rows.push({ container, bg, title, blurb })
        })

        this.cursors = this.input.keyboard.createCursorKeys()
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

        const digitKeys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX)
        ]
        digitKeys.forEach((key, i) => {
            key.on("down", () => {
                this.selectedIndex = i
                this.refreshSelectionHighlight()
                this.startLevel(i)
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
        })
    }

    startLevel(index) {
        const lvl = LEVELS[index]
        if (!lvl) return
        this.scene.start(lvl.key)
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.selectedIndex = (this.selectedIndex + LEVELS.length - 1) % LEVELS.length
            this.refreshSelectionHighlight()
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.selectedIndex = (this.selectedIndex + 1) % LEVELS.length
            this.refreshSelectionHighlight()
        }
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.startLevel(this.selectedIndex)
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            this.startLevel(this.selectedIndex)
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.start("MenuScene")
        }
    }
}
