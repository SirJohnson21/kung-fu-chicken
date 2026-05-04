import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { playLevelBgm, registerLevelBgmShutdown } from "../utils/levelBgm.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import { PLAYER_KICK_RANGE_PX } from "../utils/playerKickRange.js"
import { setPlayerAirborneVisual } from "../utils/playerAirbornePose.js"
import level5ThoughtUrl from "../assets/level5.png?url"
import level5BgmUrl from "../assets/level5-bgm.m4a?url"

export default class Level5Scene extends Phaser.Scene {
    constructor() {
        super("Level5Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
        // Unique key — Phaser's global texture cache reuses "enemy" from other levels otherwise.
        this.load.image("level5Thought", level5ThoughtUrl)
        this.load.audio("kickSound", assetUrl("assets/kick.mp3"))
        this.load.audio("hitSound", assetUrl("assets/hit.mp3"))
        this.load.audio("quoteSound", assetUrl("assets/quote.mp3"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level5Bgm", level5BgmUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#0f1218")

        this.buildLevel5SubwayBackdrop()
        this.drawLevel5SubwayPlatformAndTracks()

        const hudTitle = {
            fontSize: "26px",
            color: "#f8fafc",
            stroke: "#0c1929",
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
            fontSize: "22px",
            color: "#fef9c3",
            stroke: "#0f172a",
            strokeThickness: 4
        }

        this.add.text(20, 20, "LEVEL 5: KICK THE BAD THOUGHTS", hudTitle).setDepth(30)

        this.add
            .text(20, 52, "Move & jump | X to kick bad thoughts | ESC — level select", hudSub)
            .setDepth(30)

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x6d737c)
        this.physics.add.existing(this.ground, true)
        this.ground.setDepth(3)

        this.platformSafetyStrip = this.add.graphics().setDepth(5)
        this.platformSafetyStrip.fillStyle(0xfacc15, 1)
        this.platformSafetyStrip.fillRect(0, 528, 1000, 7)
        this.platformSafetyStrip.lineStyle(1, 0xca8a04, 0.6)
        this.platformSafetyStrip.strokeRect(0, 528, 1000, 7)

        this.player = this.physics.add.sprite(500, 450, "chicken", 0)
        this.player.setScale(0.72)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(16)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        this.anims.create({
            key: "run5",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "kick5",
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
        this.isComplete = false
        this.isGameOver = false

        this.targetKicks = 10
        this.kicksLanded = 0
        this.lives = 3

        this.hud = this.add.text(20, 92, "", hudScore).setDepth(30)
        this.updateHud()
        setupPlayerHealthBar(this, {
            yOffset: -78,
            bgColor: 0x111827,
            borderColor: 0xfacc15,
            filledColor: 0x22c55e,
            emptyColor: 0x374151,
            labelColor: "#e5e7eb"
        })
        this.refreshHealthBar()

        this.kickLines = [
            "Get out of my head!",
            "Not today, doubt!",
            "That thought’s not welcome here!",
            "Mind’s closed to that!",
            "Cluck off, negativity!",
            "I’m not carrying that!",
            "Clear skies ahead!",
            "Peace — bucket by bucket!"
        ]

        // Just below the "Thoughts kicked" HUD (hud is y=90, ~22px line).
        const kickLineY = 146
        this.lineBubble = this.add.rectangle(500, kickLineY, 540, 58, 0x1e293b, 0.96)
            .setStrokeStyle(2, 0xfacc15, 1)
            .setVisible(false)
            .setDepth(1100)

        this.lineText = this.add.text(500, kickLineY, "", {
            fontSize: "20px",
            color: "#f1f5f9",
            align: "center",
            wordWrap: { width: 500 }
        })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1100)

        this.thoughts = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })

        this.physics.add.overlap(this.player, this.thoughts, this.touchThought, null, this)

        this.spawnEvent = this.time.addEvent({
            delay: 2200,
            callback: this.spawnThought,
            callbackScope: this,
            loop: true
        })

        this.spawnThought()

        registerEscToLevelSelect(this)

        playLevelBgm(this, "level5Bgm")
        registerLevelBgmShutdown(this, "level5Bgm")
    }

    buildLevel5SubwayBackdrop() {
        const g = this.add.graphics().setDepth(-24)

        g.fillStyle(0x141a22, 1)
        g.fillRect(0, 0, 1000, 530)

        const tw = 48
        const th = 40
        for (let row = 0; row < 11; row++) {
            for (let col = 0; col < 25; col++) {
                const ox = (row % 2) * (tw / 2)
                const x = col * tw - ox - 10
                const y = 34 + row * th
                const alt = (col + row * 2) % 4
                const c = alt === 0 ? 0x3d4650 : alt === 1 ? 0x343c44 : 0x2f363e
                g.fillStyle(c, 1)
                g.fillRect(x, y, tw - 2, th - 2)
                g.lineStyle(1, 0x94a3b8, 0.18)
                g.strokeRect(x, y, tw - 2, th - 2)
            }
        }

        const lineColors = [0x0039a6, 0xff6319, 0x6d6e71, 0xfccc0a, 0x808183]
        for (let i = 0; i < lineColors.length; i++) {
            g.fillStyle(lineColors[i], 0.62)
            g.fillRect(48 + i * 188, 208, 132, 12)
        }

        g.fillStyle(0x1e252d, 1)
        g.fillRect(0, 0, 52, 530)
        g.fillRect(948, 0, 52, 530)
        g.lineStyle(2, 0x0a0e14, 1)
        g.strokeRect(0, 0, 52, 530)
        g.strokeRect(948, 0, 52, 530)

        g.fillStyle(0x0a0d12, 1)
        g.fillRect(0, 0, 1000, 30)
        const lights = [
            [95, 9, 250, 11],
            [385, 8, 210, 10],
            [655, 9, 230, 11]
        ]
        for (const [lx, ly, lw, lh] of lights) {
            g.fillStyle(0xfffacd, 0.32)
            g.fillRect(lx, ly, lw, lh)
            g.fillStyle(0xffffff, 0.12)
            g.fillRect(lx + 3, ly + 2, lw - 6, lh - 4)
        }

        this.add
            .text(500, 44, "LOCAL — Mind Health Line", {
                fontSize: "13px",
                color: "#94a3b8",
                fontStyle: "italic"
            })
            .setOrigin(0.5)
            .setAlpha(0.5)
            .setDepth(-2)

        this.add
            .text(500, 318, "NEXT TRAIN\nPEACE OF MIND", {
                fontSize: "18px",
                color: "#475569",
                align: "center",
                lineSpacing: 4
            })
            .setOrigin(0.5)
            .setAlpha(0.35)
            .setDepth(-2)
    }

    drawLevel5SubwayPlatformAndTracks() {
        const plat = this.add.graphics().setDepth(-8)

        plat.fillStyle(0x4b5563, 1)
        plat.fillRect(0, 488, 1000, 56)
        plat.fillStyle(0x525a66, 0.9)
        plat.fillRect(0, 488, 1000, 18)
        plat.lineStyle(2, 0x1f2937, 0.85)
        plat.strokeRect(0, 488, 1000, 56)

        const pit = this.add.graphics().setDepth(-6)
        pit.fillStyle(0x050608, 1)
        pit.fillRect(0, 544, 1000, 56)

        pit.lineStyle(4, 0x52525b, 1)
        pit.lineBetween(0, 562, 1000, 562)
        pit.lineBetween(0, 578, 1000, 578)

        for (let x = 12; x < 1000; x += 38) {
            pit.fillStyle(0x3f3a36, 1)
            pit.fillRect(x, 559, 22, 7)
        }

        pit.lineStyle(2, 0x71717a, 0.55)
        pit.lineBetween(0, 545, 1000, 545)
    }

    updateHud() {
        this.hud.setText(`Thoughts kicked: ${this.kicksLanded} / ${this.targetKicks}`)
    }

    spawnThought() {
        if (this.isComplete || this.isGameOver) return

        const side = Phaser.Math.Between(0, 1) === 0 ? "left" : "right"
        const x = side === "left" ? -40 : 1040
        const y = Phaser.Math.Between(280, 500)

        const t = this.thoughts.create(x, y, "level5Thought")
        t.setScale(0.12)
        t.setDepth(14)
        t.body.setAllowGravity(false)
        t.body.setSize(t.width * 0.55, t.height * 0.55, true)

        const toPlayerX = this.player.x - t.x
        const toPlayerY = this.player.y - t.y
        const len = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY) || 1
        const speed = Phaser.Math.Between(45, 85)
        t.body.setVelocity((toPlayerX / len) * speed, (toPlayerY / len) * speed)

        t.wobblePhase = Phaser.Math.FloatBetween(0, Math.PI * 2)
    }

    touchThought(player, pot) {
        if (this.isComplete || this.isGameOver) return
        if (!pot.active) return
        if (pot.kicked) return
        if (this.isKicking) return

        pot.destroy()

        if (this.sound.get("hitSound")) {
            this.sound.play("hitSound", { volume: 0.55 })
        }

        this.lives -= 1
        this.refreshHealthBar()

        if (this.lives <= 0) {
            this.isGameOver = true
            if (this.spawnEvent) this.spawnEvent.remove(false)
            this.time.delayedCall(400, () => this.scene.restart())
        }
    }

    tryKickThoughts() {
        const push = 420

        let hitCount = 0
        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active || pot.kicked) return

            const d = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                pot.x,
                pot.y
            )
            if (d > PLAYER_KICK_RANGE_PX) return

            const potLeft = pot.x < this.player.x
            const potRight = pot.x > this.player.x

            let hit = false
            if (this.player.flipX && potLeft) {
                pot.x -= 50
                pot.body.setVelocityX(-push)
                pot.body.setVelocityY(-120)
                hit = true
            } else if (!this.player.flipX && potRight) {
                pot.x += 50
                pot.body.setVelocityX(push)
                pot.body.setVelocityY(-120)
                hit = true
            }

            if (hit) {
                hitCount += 1
                pot.kicked = true
                this.time.delayedCall(900, () => {
                    if (pot.active) pot.destroy()
                })
            }
        })

        if (hitCount > 0) {
            this.kicksLanded += hitCount
            this.updateHud()

            if (this.sound.get("quoteSound")) {
                this.sound.play("quoteSound", { volume: 0.45 })
            }

            const line = Phaser.Utils.Array.GetRandom(this.kickLines)
            this.showKickLine(line)

            if (this.kicksLanded >= this.targetKicks) {
                this.completeLevel()
            }
        }
    }

    showKickLine(message) {
        this.lineText.setText(message)
        this.lineBubble.setVisible(true)
        this.lineText.setVisible(true)
        this.lineBubble.setAlpha(0)
        this.lineText.setAlpha(0)

        this.tweens.add({
            targets: [this.lineBubble, this.lineText],
            alpha: 1,
            duration: 120
        })

        this.time.delayedCall(1600, () => {
            this.tweens.add({
                targets: [this.lineBubble, this.lineText],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    this.lineBubble.setVisible(false)
                    this.lineText.setVisible(false)
                }
            })
        })
    }

    completeLevel() {
        if (this.isComplete || this.isGameOver) return
        this.isComplete = true

        if (this.spawnEvent) this.spawnEvent.remove(false)
        this.thoughts.clear(true, true)

        if (this.sound.get("winSound")) {
            this.sound.play("winSound", { volume: 0.55 })
        }

        this.time.delayedCall(700, () => {
            this.scene.start("Level5WinScene")
        })
    }

    update() {
        if (goToLevelSelectIfEsc(this)) return

        const onGround = this.player.body.blocked.down || this.player.body.touching.down
        const justJumped = Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround

        syncPlayerHealthBarPosition(this)

        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active) return
            pot.wobblePhase += 0.06
            pot.y += Math.sin(pot.wobblePhase) * 0.35
            if (pot.x < -80 || pot.x > 1080) {
                pot.destroy()
            }
        })

        if (this.isComplete || this.isGameOver) return

        if (Phaser.Input.Keyboard.JustDown(this.kickKey) && !this.isKicking) {
            this.isKicking = true
            this.player.setVelocityX(0)
            this.player.anims.stop()
            this.player.play("kick5", true)
            this.player.setAngle(this.player.flipX ? 18 : -18)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.5 })
            }

            this.tryKickThoughts()

            this.time.delayedCall(180, () => {
                this.isKicking = false
                this.player.setAngle(0)

                const onGroundNow =
                    this.player.body.blocked.down || this.player.body.touching.down

                if (onGroundNow) {
                    this.player.anims.stop()
                    this.player.setFrame(0)
                } else {
                    setPlayerAirborneVisual(this.player)
                }
            })

            return
        }

        if (this.isKicking) return

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-220)
            this.player.setFlipX(true)
            this.player.setAngle(0)
            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run5")) {
                this.player.play("run5", true)
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(220)
            this.player.setFlipX(false)
            this.player.setAngle(0)
            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run5")) {
                this.player.play("run5", true)
            }
        } else {
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
}
