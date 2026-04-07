import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import level5ThoughtUrl from "../assets/level5.png?url"
import level7BossMusicUrl from "../assets/level7-boss.mp3?url"

const MAX_BOSS_HP = 10

/** BGM loudness — tweak if the track feels hot or quiet next to SFX */
const BOSS_MUSIC_VOLUME = 0.3

export default class Level7Scene extends Phaser.Scene {
    constructor() {
        super("Level7Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.image("level5Thought", level5ThoughtUrl)
        this.load.audio("kickSound", assetUrl("assets/kick.mp3"))
        this.load.audio("hitSound", assetUrl("assets/hit.mp3"))
        this.load.audio("quoteSound", assetUrl("assets/quote.mp3"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level7BossMusic", level7BossMusicUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#12081c")

        this.add.rectangle(500, 300, 1000, 600, 0x1a0d28).setDepth(-10)
        for (let i = 0; i < 20; i++) {
            const s = Phaser.Math.FloatBetween(1, 2.5)
            const st = this.add.circle(
                Phaser.Math.Between(0, 1000),
                Phaser.Math.Between(0, 320),
                s,
                0x6a4a9e,
                0.35
            )
            st.setDepth(-9)
        }

        this.add.text(20, 16, "LEVEL 7: THE BIG DOUBT", {
            fontSize: "26px",
            color: "#e8d4ff"
        })

        this.add.text(20, 46, "Kick doubts back into the boss — don’t let them touch you!", {
            fontSize: "17px",
            color: "#b8a0d8"
        })

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x2d1f3d)
        this.physics.add.existing(this.ground, true)

        this.player = this.physics.add.sprite(340, 450, "chicken", 0)
        this.player.setScale(0.72)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        this.anims.create({
            key: "run7",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "flap7",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
            repeat: -1
        })

        this.anims.create({
            key: "kick7",
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

        this.bossHp = MAX_BOSS_HP
        this.lives = 3

        this.hud = this.add.text(20, 78, "", {
            fontSize: "21px",
            color: "#f0e8ff"
        })
        this.createHealthBar()
        this.refreshHealthBar()
        this.createBossHealthBar()
        this.updateHud()

        this.buildBoss()

        this.thoughts = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })

        this.physics.add.overlap(this.player, this.thoughts, this.touchThought, null, this)

        this.spawnEvent = this.time.addEvent({
            delay: this.getSpawnDelay(),
            callback: this.spawnThought,
            callbackScope: this,
            loop: true
        })

        this.kickLines = [
            "Right back at you!",
            "Not my coop!",
            "Return to sender!",
            "That’s your baggage!",
            "Cluck off, doubt!",
            "Bounced!"
        ]

        this.lineBubble = this.add.rectangle(500, 118, 520, 52, 0x2a1a40)
            .setStrokeStyle(2, 0xc090ff)
            .setVisible(false)

        this.lineText = this.add.text(500, 118, "", {
            fontSize: "18px",
            color: "#f5ecff",
            align: "center",
            wordWrap: { width: 480 }
        }).setOrigin(0.5).setVisible(false)

        if (this.cache.audio.exists("level7BossMusic")) {
            this.sound.play("level7BossMusic", { loop: true, volume: BOSS_MUSIC_VOLUME })
        }

        this.events.once("shutdown", () => {
            this.stopBossMusic()
        })
    }

    stopBossMusic() {
        if (this.cache.audio.exists("level7BossMusic")) {
            this.sound.stopByKey("level7BossMusic")
        }
    }

    getSpawnDelay() {
        let d = 2100
        if (this.bossHp <= 5) d *= 0.72
        if (this.bossHp <= 2) d *= 0.65
        return Math.max(720, Math.floor(d))
    }

    refreshSpawnRate() {
        if (!this.spawnEvent || this.isComplete || this.isGameOver) return
        this.spawnEvent.remove(false)
        this.spawnEvent = this.time.addEvent({
            delay: this.getSpawnDelay(),
            callback: this.spawnThought,
            callbackScope: this,
            loop: true
        })
    }

    buildBoss() {
        this.bossX = 820
        this.bossY = 348
        this.bossContainer = this.add.container(this.bossX, this.bossY)
        this.bossContainer.setDepth(4)

        const layers = [
            [0, 12, 100, 0x4a2d6e],
            [-38, -8, 62, 0x5c3d82],
            [42, -18, 54, 0x553470],
            [-18, -42, 44, 0x6b4a90],
            [22, 28, 38, 0x3d2658]
        ]
        for (const [ox, oy, r, c] of layers) {
            this.bossContainer.add(this.add.circle(ox, oy, r, c))
        }

        const eyeL = this.add.circle(-28, -18, 14, 0xfff2c8)
        const eyeR = this.add.circle(28, -18, 14, 0xfff2c8)
        this.bossContainer.add(eyeL)
        this.bossContainer.add(eyeR)
        this.bossContainer.add(this.add.circle(-28, -18, 7, 0x1a0a20))
        this.bossContainer.add(this.add.circle(28, -18, 7, 0x1a0a20))

        const mouth = this.add.ellipse(0, 28, 72, 28, 0x2a1020)
        this.bossContainer.add(mouth)

        this.tweens.add({
            targets: this.bossContainer,
            y: this.bossY - 10,
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
    }

    createHealthBar() {
        const h = 8
        const segW = 15
        const gap = 2
        const totalW = 3 * segW + 2 * gap
        const bg = this.add
            .rectangle(0, 5, totalW + 6, h + 3, 0x1a1530)
            .setStrokeStyle(1, 0xc090ff)

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

    createBossHealthBar() {
        const w = 320
        const h = 14
        this.bossHpBg = this.add
            .rectangle(500, 36, w + 8, h + 8, 0x1f1230)
            .setStrokeStyle(2, 0x8b5cf6)
            .setDepth(50)
        this.bossHpFill = this.add.rectangle(500 - w / 2, 36, w, h, 0xa855f7).setOrigin(0, 0.5).setDepth(51)
        this.bossHpLabel = this.add
            .text(500, 62, "", {
                fontSize: "15px",
                color: "#d8c4f0"
            })
            .setOrigin(0.5, 0)
            .setDepth(52)
        this.refreshBossHealthBar()
    }

    refreshBossHealthBar() {
        const w = 320
        const t = this.bossHp / MAX_BOSS_HP
        this.bossHpFill.width = Math.max(0, w * t)
        this.bossHpFill.x = 500 - w / 2
        this.bossHpFill.setFillStyle(t < 0.35 ? 0xe11d48 : t < 0.6 ? 0xf97316 : 0xa855f7)
        this.bossHpLabel.setText(`The Big Doubt — ${this.bossHp} / ${MAX_BOSS_HP}`)
    }

    updateHud() {
        this.hud.setText(`Knock doubts into the boss to win.`)
    }

    spawnThought() {
        if (this.isComplete || this.isGameOver) return

        const bx = this.bossContainer.x - 50
        const by = this.bossContainer.y + Phaser.Math.Between(-55, 55)

        const t = this.thoughts.create(bx, by, "level5Thought")
        t.setScale(0.13)
        t.body.setAllowGravity(false)
        t.body.setSize(t.width * 0.55, t.height * 0.55, true)

        const toPx = this.player.x - t.x
        const toPy = this.player.y - t.y
        const len = Math.sqrt(toPx * toPx + toPy * toPy) || 1
        const speed = Phaser.Math.Between(52, 92)
        t.body.setVelocity((toPx / len) * speed, (toPy / len) * speed)

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
        this.cameras.main.flash(180, 255, 120, 120, false)

        if (this.lives <= 0) {
            this.isGameOver = true
            if (this.spawnEvent) this.spawnEvent.remove(false)
            this.stopBossMusic()
            this.time.delayedCall(450, () => this.scene.restart())
        }
    }

    tryKickThoughts() {
        const range = 135
        const push = 480

        let hitCount = 0
        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active || pot.kicked) return

            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, pot.x, pot.y)
            if (d > range) return

            const potLeft = pot.x < this.player.x
            const potRight = pot.x > this.player.x

            let hit = false
            if (this.player.flipX && potLeft) {
                pot.x -= 50
                pot.body.setVelocityX(-push)
                pot.body.setVelocityY(-130)
                hit = true
            } else if (!this.player.flipX && potRight) {
                pot.x += 50
                pot.body.setVelocityX(push)
                pot.body.setVelocityY(-130)
                hit = true
            }

            if (hit) {
                hitCount += 1
                pot.kicked = true
                pot.damageBoss = true
                this.time.delayedCall(1400, () => {
                    if (pot.active) pot.destroy()
                })
            }
        })

        if (hitCount > 0) {
            if (this.sound.get("quoteSound")) {
                this.sound.play("quoteSound", { volume: 0.45 })
            }

            const line = Phaser.Utils.Array.GetRandom(this.kickLines)
            this.showKickLine(line)
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

        this.time.delayedCall(1400, () => {
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

    getBossHitBounds() {
        const cx = this.bossContainer.x
        const cy = this.bossContainer.y
        return {
            left: cx - 130,
            right: cx + 130,
            top: cy - 110,
            bottom: cy + 110
        }
    }

    checkKickedVsBoss() {
        if (this.isComplete || this.isGameOver) return

        const b = this.getBossHitBounds()

        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active || !pot.kicked || !pot.damageBoss) return

            if (pot.x >= b.left && pot.x <= b.right && pot.y >= b.top && pot.y <= b.bottom) {
                pot.damageBoss = false
                pot.destroy()

                this.bossHp -= 1
                this.refreshBossHealthBar()
                this.refreshSpawnRate()

                this.cameras.main.shake(180, 0.0065)
                this.cameras.main.flash(120, 200, 180, 255, false)

                this.tweens.add({
                    targets: this.bossContainer,
                    x: this.bossContainer.x + Phaser.Math.Between(-10, 10),
                    duration: 40,
                    yoyo: true,
                    repeat: 3
                })

                if (this.sound.get("kickSound")) {
                    this.sound.play("kickSound", { volume: 0.38 })
                }

                if (this.bossHp <= 0) {
                    this.completeLevel()
                }
            }
        })
    }

    completeLevel() {
        if (this.isComplete || this.isGameOver) return
        this.isComplete = true

        if (this.spawnEvent) this.spawnEvent.remove(false)
        this.thoughts.clear(true, true)

        this.stopBossMusic()

        if (this.sound.get("winSound")) {
            this.sound.play("winSound", { volume: 0.58 })
        }

        this.tweens.add({
            targets: this.bossContainer,
            alpha: 0,
            scale: 0.3,
            duration: 900,
            ease: "power2.in"
        })

        this.time.delayedCall(900, () => {
            this.scene.start("Level7WinScene")
        })
    }

    update() {
        const onGround = this.player.body.blocked.down || this.player.body.touching.down

        if (this.healthBarContainer && this.player?.active) {
            this.healthBarContainer.setPosition(this.player.x, this.player.y - 78)
        }

        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active) return
            pot.wobblePhase += 0.065
            pot.y += Math.sin(pot.wobblePhase) * 0.32
            if (pot.x < -100 || pot.x > 1100) {
                pot.destroy()
            }
        })

        this.checkKickedVsBoss()

        if (this.isComplete || this.isGameOver) return

        if (Phaser.Input.Keyboard.JustDown(this.kickKey) && !this.isKicking) {
            this.isKicking = true
            this.player.setVelocityX(0)
            this.player.anims.stop()
            this.player.play("kick7", true)
            this.player.setAngle(this.player.flipX ? 18 : -18)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.48 })
            }

            this.tryKickThoughts()

            this.time.delayedCall(180, () => {
                this.isKicking = false
                this.player.setAngle(0)

                const onGroundNow = this.player.body.blocked.down || this.player.body.touching.down

                if (onGroundNow) {
                    this.player.anims.stop()
                    this.player.setFrame(0)
                } else {
                    this.player.play("flap7", true)
                }
            })

            return
        }

        if (this.isKicking) return

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-220)
            this.player.setFlipX(true)
            this.player.setAngle(0)
            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run7")) {
                this.player.play("run7", true)
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(220)
            this.player.setFlipX(false)
            this.player.setAngle(0)
            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run7")) {
                this.player.play("run7", true)
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
            this.player.play("flap7", true)
            this.player.setAngle(-10)
        }

        if (!onGround) {
            this.player.play("flap7", true)
            this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
        }
    }
}
