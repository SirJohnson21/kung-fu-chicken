import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import level5ThoughtUrl from "../assets/level5.png?url"

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
    }

    create() {
        this.cameras.main.setBackgroundColor("#1a1530")

        this.add.text(20, 20, "LEVEL 5: KICK THE BAD THOUGHTS", {
            fontSize: "26px",
            color: "#e8e0ff"
        })

        this.add.text(20, 52, "Move & jump | X to kick bad thoughts | ESC — level select", {
            fontSize: "18px",
            color: "#b8a8e0"
        })

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x3d3558)
        this.physics.add.existing(this.ground, true)

        this.player = this.physics.add.sprite(500, 450, "chicken", 0)
        this.player.setScale(0.72)
        this.player.setCollideWorldBounds(true)
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
            key: "flap5",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
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

        this.hud = this.add.text(20, 90, "", {
            fontSize: "22px",
            color: "#ffffff"
        })
        this.updateHud()
        this.createHealthBar()
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

        this.lineBubble = this.add.rectangle(500, 125, 520, 56, 0x2a2440)
            .setStrokeStyle(2, 0x9b7dff)
            .setVisible(false)

        this.lineText = this.add.text(500, 125, "", {
            fontSize: "20px",
            color: "#f0e8ff",
            align: "center",
            wordWrap: { width: 480 }
        }).setOrigin(0.5).setVisible(false)

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
    }

    updateHud() {
        this.hud.setText(`Thoughts kicked: ${this.kicksLanded} / ${this.targetKicks}`)
    }

    createHealthBar() {
        const h = 8
        const segW = 15
        const gap = 2
        const totalW = 3 * segW + 2 * gap
        const bg = this.add
            .rectangle(0, 5, totalW + 6, h + 3, 0x1a1530)
            .setStrokeStyle(1, 0x9b7dff)

        this.healthSegments = []
        const startX = -totalW / 2 + segW / 2
        for (let i = 0; i < 3; i++) {
            const cx = startX + i * (segW + gap)
            const seg = this.add.rectangle(cx, 5, segW, h, 0x4ade80)
            this.healthSegments.push(seg)
        }

        this.playerNameLabel = this.add
            .text(0, -6, "Cluck Norris", {
                fontSize: "10px",
                color: "#e8dcff"
            })
            .setOrigin(0.5, 1)

        this.healthBarContainer = this.add.container(this.player.x, this.player.y - 78, [
            this.playerNameLabel,
            bg,
            ...this.healthSegments
        ])
        this.healthBarContainer.setDepth(1000)
    }

    refreshHealthBar() {
        if (!this.healthSegments) return
        for (let i = 0; i < 3; i++) {
            const filled = i < this.lives
            this.healthSegments[i].setFillStyle(filled ? 0x4ade80 : 0x4a4558)
        }
    }

    spawnThought() {
        if (this.isComplete || this.isGameOver) return

        const side = Phaser.Math.Between(0, 1) === 0 ? "left" : "right"
        const x = side === "left" ? -40 : 1040
        const y = Phaser.Math.Between(280, 500)

        const t = this.thoughts.create(x, y, "level5Thought")
        t.setScale(0.12)
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
        const range = 130
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
            if (d > range) return

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

        if (this.healthBarContainer && this.player?.active) {
            this.healthBarContainer.setPosition(this.player.x, this.player.y - 78)
        }

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
                    this.player.play("flap5", true)
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
            this.player.setFrame(3)
            this.player.play("flap5", true)
            this.player.setAngle(-10)
        }

        if (!onGround) {
            this.player.play("flap5", true)
            this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
        }
    }
}
