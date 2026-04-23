import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { playLevelBgm, registerLevelBgmShutdown, stopLevelBgm } from "../utils/levelBgm.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import hoopPassUrl from "../assets/egg-collect.mp3?url"
import level6BgmUrl from "../assets/level6-bgm.m4a?url"

export default class Level6Scene extends Phaser.Scene {
    constructor() {
        super("Level6Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("hoopPass", hoopPassUrl)
        this.load.audio("level6Bgm", level6BgmUrl)
    }

    create() {
        this.buildHeavenBackdrop()

        this.add
            .text(20, 18, "LEVEL 6: FLOW OF HOPE", {
                fontSize: "26px",
                color: "#1a3d5c"
            })
            .setDepth(30)

        this.add
            .text(20, 48, "↑ ↓ steer through each ring — ESC — level select", {
                fontSize: "17px",
                color: "#2d5580"
            })
            .setDepth(30)

        this.scrollSpeed = 195
        this.hoopsCleared = 0
        this.targetHoops = 10
        this.lives = 3
        this.invulnerableUntil = 0
        this.isComplete = false
        this.isGameOver = false

        this.scoreLineX = 240

        this.hud = this.add
            .text(20, 82, "", {
                fontSize: "24px",
                color: "#0f4a6e"
            })
            .setDepth(30)
        this.updateHud()

        this.player = this.physics.add.sprite(this.scoreLineX, 300, "chicken", 3)
        this.player.setScale(0.78)
        this.player.body.setAllowGravity(false)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(20)

        this.anims.create({
            key: "fly6",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 12,
            repeat: -1
        })
        this.player.play("fly6")

        this.cursors = this.input.keyboard.createCursorKeys()
        this.moveSpeed = 280

        this.hoops = []
        this.hoopSpawnIndex = 0

        setupPlayerHealthBar(this, {
            yOffset: -74,
            bgColor: 0x3d7cba,
            borderColor: 0xffffff,
            filledColor: 0x7cfc98,
            emptyColor: 0x8fa8c0,
            labelColor: "#0f3d6b"
        })
        this.refreshHealthBar()

        this.spawnHoop()

        this.spawnTimer = this.time.addEvent({
            delay: 2100,
            callback: () => {
                if (!this.isComplete && !this.isGameOver) this.spawnHoop()
            },
            loop: true
        })

        playLevelBgm(this, "level6Bgm")
        registerLevelBgmShutdown(this, "level6Bgm")

        registerEscToLevelSelect(this)
    }

    buildHeavenBackdrop() {
        this.cameras.main.setBackgroundColor("#b8dcff")

        this.add.rectangle(500, 200, 1000, 400, 0x9fd4ff).setDepth(-50)
        this.add.rectangle(500, 480, 1000, 280, 0xc8e9ff).setDepth(-50)
        this.add.rectangle(500, 560, 1000, 120, 0xe8f6ff).setDepth(-50)

        const glow = this.add.circle(860, 100, 90, 0xfff4d6, 0.45)
        glow.setDepth(-49)
        this.add.circle(860, 95, 58, 0xfffdf5, 0.98).setDepth(-48)

        this.heavenClouds = []
        for (let i = 0; i < 11; i++) {
            const x = Phaser.Math.Between(-100, 1000)
            const y = Phaser.Math.Between(70, 440)
            const c = this.makeCloud(x, y)
            c.setDepth(-47)
            this.heavenClouds.push({
                container: c,
                speed: Phaser.Math.FloatBetween(0.04, 0.14)
            })
        }

        const rays = this.add.graphics()
        rays.fillStyle(0xfff9e0, 0.12)
        rays.beginPath()
        rays.moveTo(860, 95)
        rays.lineTo(620, 600)
        rays.lineTo(720, 600)
        rays.closePath()
        rays.fillPath()
        rays.beginPath()
        rays.moveTo(860, 95)
        rays.lineTo(900, 600)
        rays.lineTo(1000, 600)
        rays.closePath()
        rays.fillPath()
        rays.setDepth(-49)
    }

    makeCloud(x, y) {
        const c = this.add.container(x, y)
        const blobs = [
            [0, 0, 38],
            [32, 6, 46],
            [68, 2, 36],
            [36, -14, 34],
            [52, -8, 28]
        ]
        for (const [bx, by, r] of blobs) {
            const circ = this.add.circle(bx, by, r, 0xffffff, Phaser.Math.FloatBetween(0.88, 0.98))
            c.add(circ)
        }
        return c
    }

    updateHud() {
        this.hud.setText(`Hoops cleared: ${this.hoopsCleared} / ${this.targetHoops}`)
    }

    spawnHoop() {
        const kind = this.hoopSpawnIndex % 2 === 0 ? "hope" : "peace"
        this.hoopSpawnIndex += 1
        const gapY = Phaser.Math.Between(190, 410)
        const gapHalf = 80
        const gapTop = gapY - gapHalf
        const gapBottom = gapY + gapHalf
        const x = 1080

        const labelColor = kind === "hope" ? "#0d5c2e" : "#3b4f9e"

        const g = this.add.graphics()
        g.setDepth(5)
        this.drawHoopRing(g, x, gapY, kind === "hope" ? 0x2ecc71 : 0x6c8cff)

        const label = this.add
            .text(x, gapY + 114, kind === "hope" ? "hope" : "peace", {
                fontSize: "15px",
                color: labelColor
            })
            .setOrigin(0.5)
            .setAlpha(0.92)
            .setDepth(6)

        const hoop = {
            x,
            prevX: x,
            gapY,
            gapTop,
            gapBottom,
            kind,
            g,
            label,
            scored: false,
            failed: false
        }
        this.hoops.push(hoop)
    }

    drawHoopRing(graphics, cx, cy, color) {
        graphics.clear()
        graphics.lineStyle(16, color, 0.4)
        graphics.strokeCircle(cx, cy, 100)
        graphics.lineStyle(9, color, 1)
        graphics.strokeCircle(cx, cy, 86)
        graphics.lineStyle(4, 0xffffff, 0.5)
        graphics.strokeCircle(cx, cy, 93)
    }

    hitPlayer() {
        if (this.time.now < this.invulnerableUntil || this.isComplete || this.isGameOver) return

        this.lives -= 1
        this.invulnerableUntil = this.time.now + 900
        this.updateHud()
        this.refreshHealthBar()

        this.cameras.main.flash(200, 255, 200, 200, false)

        if (this.lives <= 0) {
            this.isGameOver = true
            if (this.spawnTimer) this.spawnTimer.remove(false)
            stopLevelBgm(this, "level6Bgm")
            this.time.delayedCall(500, () => this.scene.restart())
        }
    }

    tryScoreAndCollide(hoop, dt) {
        if (this.isComplete) return

        hoop.prevX = hoop.x
        hoop.x -= this.scrollSpeed * (dt / 1000)
        const py = this.player.y
        const halfBody = 48

        hoop.label.setX(hoop.x)

        this.drawHoopRing(
            hoop.g,
            hoop.x,
            hoop.gapY,
            hoop.kind === "hope" ? 0x2ecc71 : 0x6c8cff
        )

        const safeLow = hoop.gapTop + halfBody
        const safeHigh = hoop.gapBottom - halfBody

        const inColumn = hoop.x > 175 && hoop.x < 298
        if (inColumn && this.time.now >= this.invulnerableUntil) {
            if (py < safeLow || py > safeHigh) {
                if (!hoop.failed) {
                    hoop.failed = true
                    this.hitPlayer()
                }
            }
        }

        const lineX = this.scoreLineX
        if (!hoop.scored && hoop.prevX > lineX && hoop.x <= lineX) {
            if (py >= safeLow && py <= safeHigh) {
                hoop.scored = true
                this.hoopsCleared += 1
                this.updateHud()
                hoop.label.setColor("#0a4d1a")
                if (this.sound.get("hoopPass")) {
                    this.sound.play("hoopPass", { volume: 0.42 })
                }
                if (this.hoopsCleared >= this.targetHoops) {
                    this.completeLevel()
                }
            }
        }
    }

    completeLevel() {
        if (this.isComplete || this.isGameOver) return
        this.isComplete = true
        if (this.spawnTimer) this.spawnTimer.remove(false)

        stopLevelBgm(this, "level6Bgm")

        if (this.sound.get("winSound")) {
            this.sound.play("winSound", { volume: 0.5 })
        }

        this.time.delayedCall(600, () => {
            this.scene.start("Level6WinScene")
        })
    }

    update(_time, delta) {
        if (goToLevelSelectIfEsc(this)) return

        if (this.isComplete || this.isGameOver) return

        syncPlayerHealthBarPosition(this)

        if (this.heavenClouds) {
            for (const cloud of this.heavenClouds) {
                cloud.container.x += cloud.speed * delta
                if (cloud.container.x > 1120) {
                    cloud.container.x = -180
                }
            }
        }

        let vy = 0
        if (this.cursors.up.isDown) vy = -this.moveSpeed
        else if (this.cursors.down.isDown) vy = this.moveSpeed

        this.player.setVelocity(0, vy)

        for (let i = this.hoops.length - 1; i >= 0; i--) {
            const hoop = this.hoops[i]
            this.tryScoreAndCollide(hoop, delta)

            if (hoop.x < -120) {
                hoop.g.destroy()
                hoop.label.destroy()
                this.hoops.splice(i, 1)
            }
        }

        const flash = this.time.now < this.invulnerableUntil
        this.player.setAlpha(flash ? 0.5 : 1)
    }
}
