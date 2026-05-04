import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { playLevelBgm, registerLevelBgmShutdown } from "../utils/levelBgm.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import { PLAYER_KICK_RANGE_PX } from "../utils/playerKickRange.js"
import { setPlayerAirborneVisual } from "../utils/playerAirbornePose.js"
import level2BgmUrl from "../assets/level2-bgm.m4a?url"

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super("Level2Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })

        this.load.image("enemy", assetUrl("assets/enemy.png"))
        this.load.image("egg", assetUrl("assets/egg.png"))

        this.load.audio("quoteSound", assetUrl("assets/quote.mp3"))
        this.load.audio("eggSound", assetUrl("assets/egg-collect.mp3"))
        this.load.audio("kickSound", assetUrl("assets/kick.mp3"))
        this.load.audio("hitSound", assetUrl("assets/hit.mp3"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level2Bgm", level2BgmUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#1a2332")

        this.buildLevel2OfficeBackdrop()
        this.drawLevel2CarpetAndTrim()

        const hudTitle = {
            fontSize: "28px",
            color: "#f8fafc",
            stroke: "#0f172a",
            strokeThickness: 5
        }
        const hudSub = {
            fontSize: "18px",
            color: "#e2e8f0",
            stroke: "#0f172a",
            strokeThickness: 3,
            wordWrap: { width: 760 }
        }
        const hudScore = {
            fontSize: "24px",
            color: "#fef9c3",
            stroke: "#0f172a",
            strokeThickness: 4
        }

        this.add.text(20, 20, "LEVEL 2: Office Positivity", hudTitle).setDepth(26)

        this.add
            .text(20, 52, "Collect quotes and eggs | Avoid stress | X kick | ESC — level select", hudSub)
            .setDepth(26)

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x9ca3af)
        this.physics.add.existing(this.ground, true)
        this.ground.setDepth(1)

        this.platforms = this.physics.add.staticGroup()
        const deskPlatform = this.add.rectangle(700, 455, 140, 20, 0xffffff, 0)
        this.physics.add.existing(deskPlatform, true)
        this.platforms.add(deskPlatform)

        this.drawLevel2Workstations()

        this.player = this.physics.add.sprite(100, 450, "chicken", 0)
        this.player.setScale(0.85)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(12)

        this.physics.add.collider(this.player, this.ground)
        this.physics.add.collider(this.player, this.platforms)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        this.anims.create({
            key: "run2",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "kick2",
            // Short kick sequence using the last chicken frames.
            frames: [
                { key: "chicken", frame: 6 },
                { key: "chicken", frame: 7 },
                { key: "chicken", frame: 8 }
            ],
            frameRate: 20,
            repeat: 0
        })

        this.player.setFrame(0)
        this.isKicking = false
        this.lives = 3
        this.invulnerableUntil = 0

        setupPlayerHealthBar(this, {
            yOffset: -80,
            bgColor: 0x1e293b,
            borderColor: 0x64748b,
            filledColor: 0x22c55e,
            emptyColor: 0x475569,
            labelColor: "#e2e8f0"
        })
        this.refreshHealthBar()

        this.itemsCollected = 0
        this.totalItems = 4

        this.itemCounter = this.add.text(20, 92, "Collected: 0 / 4", hudScore).setDepth(26)

        this.quotePickups = this.physics.add.staticGroup()

        const quote1 = this.quotePickups.create(260, 525, null)
        quote1.setSize(40, 40)
        quote1.setVisible(false)
        quote1.visual = this.add.rectangle(260, 525, 40, 40, 0xfef3c7).setStrokeStyle(2, 0xd97706).setDepth(5)
        quote1.mark = this.add
            .text(252, 512, '"', { fontSize: "28px", color: "#92400e", stroke: "#fffbeb", strokeThickness: 2 })
            .setDepth(6)

        const quote2 = this.quotePickups.create(520, 525, null)
        quote2.setSize(40, 40)
        quote2.setVisible(false)
        quote2.visual = this.add.rectangle(520, 525, 40, 40, 0xfef3c7).setStrokeStyle(2, 0xd97706).setDepth(5)
        quote2.mark = this.add
            .text(512, 512, '"', { fontSize: "28px", color: "#92400e", stroke: "#fffbeb", strokeThickness: 2 })
            .setDepth(6)

        const quote3 = this.quotePickups.create(810, 525, null)
        quote3.setSize(40, 40)
        quote3.setVisible(false)
        quote3.visual = this.add.rectangle(810, 525, 40, 40, 0xfef3c7).setStrokeStyle(2, 0xd97706).setDepth(5)
        quote3.mark = this.add
            .text(802, 512, '"', { fontSize: "28px", color: "#92400e", stroke: "#fffbeb", strokeThickness: 2 })
            .setDepth(6)

        this.physics.add.overlap(this.player, this.quotePickups, this.collectQuote, null, this)

        this.deskEgg = this.physics.add.staticSprite(700, 390, "egg")
        this.deskEgg.setScale(0.06).refreshBody()
        this.deskEgg.setDepth(8)

        this.tweens.add({
            targets: this.deskEgg,
            y: 380,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.physics.add.overlap(this.player, this.deskEgg, this.collectDeskEgg, null, this)

        this.quoteBubble = this.add.rectangle(0, 0, 240, 64, 0xfefce8, 0.97)
            .setStrokeStyle(2, 0x78716c, 1)
            .setVisible(false)
            .setDepth(1100)

        this.quoteText = this.add.text(0, 0, "", {
            fontSize: "18px",
            color: "#292524",
            align: "center",
            wordWrap: { width: 216 }
        })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1100)

        this.quotes = [
            "Keep going.",
            "Progress beats perfection.",
            "Breathe. Reset. Rise."
        ]

        this.enemy = this.physics.add.sprite(620, 530, "enemy")
        this.enemy.setScale(0.08)
        this.enemy.setDepth(10)
        this.enemy.setCollideWorldBounds(true)
        this.enemy.body.setAllowGravity(false)
        this.enemy.body.setImmovable(true)
        this.enemy.body.setSize(140, 140)
        this.enemy.body.setOffset(30, 30)
        this.enemySpeed = 180
        this.enemy.body.setVelocityX(this.enemySpeed)

        this.physics.add.collider(this.enemy, this.ground)
        this.physics.add.overlap(this.player, this.enemy, this.hitEnemy, null, this)

        this.tweens.add({
            targets: this.enemy,
            scale: 0.09,
            duration: 200,
            yoyo: true,
            repeat: -1
        })

        registerEscToLevelSelect(this)

        playLevelBgm(this, "level2Bgm")
        registerLevelBgmShutdown(this, "level2Bgm")
    }

    buildLevel2OfficeBackdrop() {
        const g = this.add.graphics().setDepth(-20)

        g.fillStyle(0x243044, 1)
        g.fillRect(0, 0, 1000, 76)

        const lights = [
            [90, 28, 260, 16],
            [400, 26, 220, 15],
            [660, 30, 250, 16]
        ]
        for (const [lx, ly, lw, lh] of lights) {
            g.fillStyle(0xfffbeb, 0.4)
            g.fillRect(lx, ly, lw, lh)
            g.fillStyle(0xffffff, 0.12)
            g.fillRect(lx + 3, ly + 3, lw - 6, lh - 5)
        }

        g.fillStyle(0xe2e8f0, 1)
        g.fillRect(0, 76, 1000, 448)

        g.lineStyle(1, 0xcbd5e1, 0.85)
        for (let x = 0; x <= 1000; x += 96) {
            g.lineBetween(x, 76, x, 510)
        }

        g.fillStyle(0xbfdbfe, 0.35)
        g.fillRect(40, 120, 220, 140)
        g.fillRect(380, 100, 200, 120)
        g.fillRect(720, 130, 200, 130)
        g.lineStyle(2, 0x94a3b8, 0.65)
        g.strokeRect(40, 120, 220, 140)
        g.strokeRect(380, 100, 200, 120)
        g.strokeRect(720, 130, 200, 130)

        g.fillStyle(0x475569, 0.25)
        for (let i = 0; i < 5; i++) {
            g.fillRect(52 + i * 44, 135, 28, 110)
            g.fillRect(392 + i * 38, 115, 24, 92)
            g.fillRect(732 + i * 38, 145, 24, 98)
        }

        g.fillStyle(0x1e293b, 1)
        g.fillRect(0, 500, 1000, 44)

        this.add
            .text(500, 42, "OPEN FLOOR PLAN — please keep positivity stocked", {
                fontSize: "13px",
                color: "#64748b",
                fontStyle: "italic"
            })
            .setOrigin(0.5)
            .setAlpha(0.55)
            .setDepth(-2)
    }

    drawLevel2CarpetAndTrim() {
        const carpet = this.add.graphics().setDepth(2)
        const top = 540
        for (let y = top; y < 602; y += 6) {
            const alt = ((y - top) / 6) % 2 === 0
            carpet.fillStyle(alt ? 0x8b92a0 : 0x949aa8, 0.55)
            carpet.fillRect(0, y, 1000, 6)
        }
        carpet.lineStyle(1, 0x6b7280, 0.35)
        for (let x = 0; x < 1000; x += 48) {
            carpet.lineBetween(x, top, x + 22, 598)
        }

        const trim = this.add.graphics().setDepth(3)
        trim.lineStyle(4, 0xf1f5f9, 0.9)
        trim.lineBetween(0, 536, 1000, 536)
        trim.lineStyle(2, 0xe2e8f0, 0.75)
        trim.lineBetween(18, 508, 18, 598)
        trim.lineBetween(982, 508, 982, 598)
    }

    drawLevel2Workstations() {
        const d = this.add.graphics().setDepth(4)

        const drawDesk = (cx, cy, w, h, wood) => {
            const x = cx - w / 2
            const yTop = cy - h / 2
            d.fillStyle(0x334155, 1)
            d.fillRect(x + 18, yTop + 18, 16, h - 18)
            d.fillRect(x + w - 34, yTop + 18, 16, h - 18)
            d.fillStyle(0x1e293b, 1)
            d.fillRect(x + 8, yTop + h - 26, w - 16, 22)
            d.fillStyle(wood, 1)
            d.fillRect(x, yTop, w, 22)
            d.lineStyle(2, 0x78350f, 0.55)
            d.strokeRect(x, yTop, w, 22)
        }

        drawDesk(160, 470, 150, 72, 0xc4a574)
        drawDesk(700, 470, 150, 72, 0xb8956a)

        d.fillStyle(0xa16207, 1)
        d.fillRect(630, 445, 140, 20)
        d.lineStyle(2, 0x713f12, 0.75)
        d.strokeRect(630, 445, 140, 20)

        const drawMonitor = (cx, my) => {
            const mw = 76
            const mh = 48
            const mx = cx - mw / 2
            const myTop = my - mh / 2
            d.fillStyle(0x0f172a, 1)
            d.fillRect(mx - 4, myTop - 4, mw + 8, mh + 8)
            d.fillStyle(0x7dd3fc, 0.95)
            d.fillRect(mx, myTop, mw, mh)
            d.fillStyle(0xffffff, 0.2)
            d.fillRect(mx + 4, myTop + 4, mw - 14, 12)
            d.lineStyle(2, 0x334155, 1)
            d.strokeRect(mx - 4, myTop - 4, mw + 8, mh + 8)
            d.fillStyle(0x475569, 1)
            d.fillRect(cx - 16, myTop + mh + 4, 32, 10)
            d.fillStyle(0x64748b, 1)
            d.fillRect(cx - 28, myTop + mh + 12, 56, 6)
        }

        drawMonitor(160, 420)
        drawMonitor(700, 420)
    }

    collectQuote(player, pickup) {
        if (pickup.visual) pickup.visual.destroy()
        if (pickup.mark) pickup.mark.destroy()
        pickup.destroy()

        this.itemsCollected += 1
        this.itemCounter.setText(`Collected: ${this.itemsCollected} / ${this.totalItems}`)

        const quoteIndex = Math.min(this.itemsCollected - 1, this.quotes.length - 1)
        const quote = this.quotes[quoteIndex]

        if (quote) {
            this.showQuote(quote)
        }

        if (this.sound.get("quoteSound")) {
            this.sound.play("quoteSound", { volume: 0.5 })
        }

        this.checkLevelComplete()
    }

    collectDeskEgg(player, egg) {
        egg.destroy()

        this.itemsCollected += 1
        this.itemCounter.setText(`Collected: ${this.itemsCollected} / ${this.totalItems}`)

        this.showQuote("A little reward for the hard work.")

        if (this.sound.get("eggSound")) {
            this.sound.play("eggSound", { volume: 0.5 })
        }

        this.checkLevelComplete()
    }

    checkLevelComplete() {
        if (this.itemsCollected >= this.totalItems) {
            if (this.sound.get("winSound")) {
                this.sound.play("winSound", { volume: 0.6 })
            }

            this.time.delayedCall(500, () => {
                this.scene.start("Level2WinScene")
            })
        }
    }

    showQuote(message) {
        this.quoteText.setText(message)

        this.quoteBubble.setVisible(true)
        this.quoteText.setVisible(true)

        this.quoteBubble.setAlpha(0)
        this.quoteText.setAlpha(0)

        this.tweens.add({
            targets: [this.quoteBubble, this.quoteText],
            alpha: 1,
            duration: 200
        })

        this.time.delayedCall(1600, () => {
            this.tweens.add({
                targets: [this.quoteBubble, this.quoteText],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.quoteBubble.setVisible(false)
                    this.quoteText.setVisible(false)
                }
            })
        })
    }

    hitEnemy() {
        if (this.isKicking) return
        if (this.time.now < this.invulnerableUntil) return

        if (this.sound.get("hitSound")) {
            this.sound.play("hitSound", { volume: 0.6 })
        }

        this.lives -= 1
        this.refreshHealthBar()
        this.invulnerableUntil = this.time.now + 1000
        this.cameras.main.flash(140, 255, 220, 200, false)

        if (this.lives <= 0) {
            this.time.delayedCall(180, () => {
                this.scene.restart()
            })
        }
    }

    kickEnemy() {
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.enemy.x,
            this.enemy.y
        )

        const enemyIsLeft = this.enemy.x < this.player.x
        const enemyIsRight = this.enemy.x > this.player.x

        if (distance <= PLAYER_KICK_RANGE_PX) {
            if (this.player.flipX && enemyIsLeft) {
                this.enemy.x -= 120
                this.enemy.body.setVelocityX(0)
                this.enemy.setScale(0.1)
                this.cameras.main.shake(100, 0.005)

                this.time.delayedCall(120, () => {
                    this.enemy.setScale(0.08)
                    this.enemy.body.setVelocityX(-this.enemySpeed)
                })
            }
            else if (!this.player.flipX && enemyIsRight) {
                this.enemy.x += 120
                this.enemy.body.setVelocityX(0)
                this.enemy.setScale(0.1)
                this.cameras.main.shake(100, 0.005)

                this.time.delayedCall(120, () => {
                    this.enemy.setScale(0.08)
                    this.enemy.body.setVelocityX(this.enemySpeed)
                })
            }
        }
    }

    update() {
        if (goToLevelSelectIfEsc(this)) return

        syncPlayerHealthBarPosition(this)
        this.player.setAlpha(this.time.now < this.invulnerableUntil ? 0.52 : 1)

        const onGround = this.player.body.blocked.down || this.player.body.touching.down
        const justJumped = Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround

        if (this.enemy.x >= 900) {
            this.enemy.body.setVelocityX(-this.enemySpeed)
            this.enemy.setFlipX(true)
        } else if (this.enemy.x <= 500) {
            this.enemy.body.setVelocityX(this.enemySpeed)
            this.enemy.setFlipX(false)
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.isKicking = true
            this.player.anims.stop()
            this.player.setVelocityX(0)
            this.player.setAngle(this.player.flipX ? 18 : -18)
            this.player.play("kick2", true)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.5 })
            }

            this.kickEnemy()

            this.time.delayedCall(180, () => {
                this.isKicking = false
                this.player.setAngle(0)
                if (this.player.body.blocked.down || this.player.body.touching.down) {
                    this.player.anims.stop()
                    this.player.setFrame(0)
                } else {
                    setPlayerAirborneVisual(this.player)
                }
            })

            return
        }

        if (!this.isKicking) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-220)
                this.player.setFlipX(true)
                this.player.setAngle(0)

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run2")) {
                    this.player.play("run2")
                }
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(220)
                this.player.setFlipX(false)
                this.player.setAngle(0)

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run2")) {
                    this.player.play("run2")
                }
            }
            else {
                this.player.setVelocityX(0)

                if (onGround) {
                    this.player.anims.stop()
                    this.player.setFrame(0)
                    this.player.setAngle(0)
                }
            }

            if (this.cursors.up.isDown && onGround) {
                this.player.setVelocityY(-420)
                if (justJumped) {
                    this.player.setAngle(-10)
                    setPlayerAirborneVisual(this.player)
                }
            }

            if (!onGround) {
                this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
                setPlayerAirborneVisual(this.player)
            }
        }

        if (this.quoteBubble.visible) {
            // Health bar uses yOffset -80; “Cluck Norris” sits just above that — keep bubble bottom slightly above the label.
            const quoteY = this.player.y - 131
            this.quoteBubble.x = this.player.x
            this.quoteBubble.y = quoteY

            this.quoteText.x = this.player.x
            this.quoteText.y = quoteY
        }
    }
}