import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import { PLAYER_KICK_RANGE_PX } from "../utils/playerKickRange.js"
import { setPlayerAirborneVisual } from "../utils/playerAirbornePose.js"
import level5ThoughtUrl from "../assets/level5.png?url"
import level7FireballUrl from "../assets/level7-fireball.png?url"
import level7BossMusicUrl from "../assets/level7-boss.mp3?url"

const MAX_BOSS_HP = 5

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
        this.load.image("level7Fireball", level7FireballUrl)
        this.load.audio("kickSound", assetUrl("assets/kick.mp3"))
        this.load.audio("hitSound", assetUrl("assets/hit.mp3"))
        this.load.audio("quoteSound", assetUrl("assets/quote.mp3"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level7BossMusic", level7BossMusicUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#0c0e12")

        this.buildDungeonBackdrop()

        this.add.text(20, 16, "LEVEL 7: THE BIG DOUBT", {
            fontSize: "26px",
            color: "#dce4f0",
            stroke: "#0a0c10",
            strokeThickness: 4
        }).setDepth(30)

        this.add
            .text(20, 46, "Deep in the dungeon — kick doubts into the boss — don’t get hit — ESC — level select", {
                fontSize: "16px",
                color: "#9aa8bc",
                stroke: "#0a0c10",
                strokeThickness: 3,
                wordWrap: { width: 720 }
            })
            .setDepth(30)

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x262d38)
        this.physics.add.existing(this.ground, true)
        this.ground.setDepth(2)

        this.player = this.physics.add.sprite(340, 450, "chicken", 0)
        this.player.setScale(0.72)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(14)
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

        this.hud = this.add
            .text(20, 78, "", {
                fontSize: "21px",
                color: "#e8eef8",
                stroke: "#0a0c10",
                strokeThickness: 3
            })
            .setDepth(30)
        setupPlayerHealthBar(this, {
            yOffset: -78,
            bgColor: 0x161a22,
            borderColor: 0x6b7c93,
            filledColor: 0x4ade80,
            emptyColor: 0x3a404c,
            labelColor: "#dce4f0"
        })
        this.refreshHealthBar()
        this.createBossHealthBar()
        this.updateHud()

        this.buildBoss()

        this.thoughts = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })
        this.fireballs = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })
        this.nextSpawnType = "thought"

        this.physics.add.overlap(this.player, this.thoughts, this.touchThought, null, this)
        this.physics.add.overlap(this.player, this.fireballs, this.touchFireball, null, this)

        this.spawnEvent = this.time.addEvent({
            delay: this.getSpawnDelay(),
            callback: this.spawnNextHazard,
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

        this.lineBubble = this.add.rectangle(500, 90, 520, 52, 0x1e2430, 0.96)
            .setStrokeStyle(2, 0x5c6d82, 1)
            .setVisible(false)
            .setDepth(1100)

        this.lineText = this.add.text(500, 90, "", {
            fontSize: "18px",
            color: "#eef2fa",
            align: "center",
            wordWrap: { width: 480 }
        })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1100)

        if (this.cache.audio.exists("level7BossMusic")) {
            this.sound.play("level7BossMusic", { loop: true, volume: BOSS_MUSIC_VOLUME })
        }

        this.events.once("shutdown", () => {
            this.stopBossMusic()
        })

        registerEscToLevelSelect(this)
    }

    stopBossMusic() {
        if (this.cache.audio.exists("level7BossMusic")) {
            this.sound.stopByKey("level7BossMusic")
        }
    }

    getSpawnDelay() {
        let d = 2900
        if (this.bossHp <= 3) d *= 0.88
        if (this.bossHp <= 2) d *= 0.82
        if (this.bossHp <= 1) d *= 0.78
        return Math.max(980, Math.floor(d))
    }

    refreshSpawnRate() {
        if (!this.spawnEvent || this.isComplete || this.isGameOver) return
        this.spawnEvent.remove(false)
        this.spawnEvent = this.time.addEvent({
            delay: this.getSpawnDelay(),
            callback: this.spawnNextHazard,
            callbackScope: this,
            loop: true
        })
    }

    spawnNextHazard() {
        if (this.isComplete || this.isGameOver) return
        if (this.nextSpawnType === "thought") {
            this.spawnThought()
            this.nextSpawnType = "fireball"
        } else {
            this.spawnFireball()
            this.nextSpawnType = "thought"
        }
    }

    buildDungeonBackdrop() {
        const back = this.add.graphics().setDepth(-24)
        back.fillStyle(0x0e1016, 1)
        back.fillRect(0, 0, 1000, 600)

        const blockW = 62
        const blockH = 42
        for (let row = 0, y = 0; y < 340; row++, y += blockH) {
            const offset = (row % 2) * (blockW * 0.5)
            for (let x = -blockW; x < 1000 + blockW; x += blockW) {
                const bx = Math.floor(x + offset)
                const shades = [0x262b35, 0x2e3440, 0x22272f, 0x323846]
                const c = shades[(row + Math.floor(bx / blockW)) % shades.length]
                back.fillStyle(c, 1)
                back.fillRect(bx, y, blockW - 3, blockH - 3)
                back.lineStyle(1, 0x0a0c12, 0.9)
                back.strokeRect(bx, y, blockW - 3, blockH - 3)
            }
        }

        back.fillStyle(0x060708, 0.94)
        back.fillRect(0, 0, 1000, 64)

        back.fillStyle(0x2a2218, 1)
        back.fillRect(0, 48, 1000, 12)
        back.fillStyle(0x1a1510, 1)
        back.fillRect(0, 58, 1000, 8)

        const pillar = (px) => {
            back.fillStyle(0x141820, 1)
            back.fillRect(px, 0, 64, 540)
            back.fillStyle(0x2a323e, 0.45)
            back.fillRect(px + 10, 90, 12, 380)
            back.lineStyle(2, 0x050608, 1)
            back.strokeRect(px, 0, 64, 540)
        }
        pillar(0)
        pillar(936)

        const sconce = this.add.graphics().setDepth(-18)
        const drawTorch = (tx, ty) => {
            sconce.fillStyle(0x1c1410, 1)
            sconce.fillRect(tx - 6, ty - 4, 12, 18)
            sconce.fillStyle(0x3a3028, 1)
            sconce.fillTriangle(tx - 14, ty + 14, tx + 14, ty + 14, tx, ty + 4)
        }
        drawTorch(108, 168)
        drawTorch(892, 188)

        const glow = this.add.graphics().setDepth(-17)
        glow.fillStyle(0xff8c32, 0.14)
        glow.fillEllipse(108, 158, 130, 150)
        glow.fillStyle(0xffb347, 0.1)
        glow.fillEllipse(108, 158, 72, 92)
        glow.fillStyle(0xff8c32, 0.12)
        glow.fillEllipse(892, 176, 118, 138)
        glow.fillStyle(0xffb347, 0.08)
        glow.fillEllipse(892, 176, 68, 88)

        const chains = this.add.graphics().setDepth(-16)
        chains.lineStyle(3, 0x1a1e26, 0.85)
        for (let c = 0; c < 3; c++) {
            const cx = 220 + c * 280
            let cy = 52
            for (let k = 0; k < 14; k++) {
                chains.strokeCircle(cx + (k % 2) * 3, cy, 5)
                cy += 11
            }
        }

        const gate = this.add.graphics().setDepth(-15)
        gate.fillStyle(0x0a0c10, 0.55)
        gate.fillRect(300, 95, 400, 245)
        gate.lineStyle(5, 0x1f252e, 0.95)
        gate.strokeRect(302, 97, 396, 241)
        gate.lineStyle(4, 0x2c3542, 0.75)
        for (let i = 0; i < 9; i++) {
            const gx = 318 + i * 44
            gate.beginPath()
            gate.moveTo(gx, 104)
            gate.lineTo(gx, 328)
            gate.strokePath()
        }

        const floor = this.add.graphics().setDepth(-10)
        for (let fy = 360; fy < 540; fy += 28) {
            for (let fx = 0; fx < 1000; fx += 48) {
                const stagger = (fy / 28) % 2 === 0 ? 0 : 24
                const fc = [0x1c222c, 0x232a34, 0x181d24][(fx + fy) % 3]
                floor.fillStyle(fc, 1)
                floor.fillRect(fx + stagger, fy, 44, 24)
                floor.lineStyle(1, 0x0a0d12, 0.65)
                floor.strokeRect(fx + stagger, fy, 44, 24)
            }
        }

        const mist = this.add.graphics().setDepth(-6)
        mist.fillStyle(0x0a0c12, 0.22)
        mist.fillRect(0, 420, 1000, 120)
        mist.fillStyle(0x000000, 0.18)
        mist.fillEllipse(200, 520, 420, 100)
        mist.fillEllipse(780, 530, 480, 110)

        this.add
            .text(500, 128, "ABANDON HOPE\nYE WHO ENTER", {
                fontSize: "15px",
                color: "#3d4654",
                align: "center",
                lineSpacing: 4
            })
            .setOrigin(0.5)
            .setAlpha(0.55)
            .setDepth(-5)
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

    createBossHealthBar() {
        const w = 320
        const h = 14
        this.bossHpBg = this.add
            .rectangle(500, 36, w + 8, h + 8, 0x161a22)
            .setStrokeStyle(2, 0x8b5cf6, 1)
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
        const speed = Phaser.Math.Between(34, 58)
        t.body.setVelocity((toPx / len) * speed, (toPy / len) * speed)

        t.wobblePhase = Phaser.Math.FloatBetween(0, Math.PI * 2)
    }

    spawnFireball() {
        if (this.isComplete || this.isGameOver) return

        const bx = this.bossContainer.x - 65
        const by = this.bossContainer.y + Phaser.Math.Between(-65, 40)

        const fire = this.fireballs.create(bx, by, "level7Fireball")
        fire.setScale(0.18)
        fire.setDepth(9)
        fire.body.setAllowGravity(false)
        fire.body.setSize(fire.width * 0.42, fire.height * 0.42, true)

        const toPx = this.player.x - fire.x
        const toPy = this.player.y - fire.y
        const len = Math.sqrt(toPx * toPx + toPy * toPy) || 1
        const speed = Phaser.Math.Between(105, 145)
        fire.body.setVelocity((toPx / len) * speed, (toPy / len) * speed)
        fire.spin = Phaser.Math.FloatBetween(0.04, 0.09) * (Phaser.Math.Between(0, 1) ? 1 : -1)
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

    touchFireball(player, fire) {
        if (this.isComplete || this.isGameOver) return
        if (!fire?.active) return

        fire.destroy()

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
        const push = 480

        let hitCount = 0
        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active || pot.kicked) return

            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, pot.x, pot.y)
            if (d > PLAYER_KICK_RANGE_PX) return

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
        this.fireballs.clear(true, true)

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
        if (goToLevelSelectIfEsc(this)) return

        const onGround = this.player.body.blocked.down || this.player.body.touching.down
        const justJumped = Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround

        syncPlayerHealthBarPosition(this)

        this.thoughts.getChildren().forEach((pot) => {
            if (!pot.active) return
            pot.wobblePhase += 0.065
            pot.y += Math.sin(pot.wobblePhase) * 0.32
            if (pot.x < -100 || pot.x > 1100) {
                pot.destroy()
            }
        })
        this.fireballs.getChildren().forEach((fire) => {
            if (!fire.active) return
            fire.rotation += fire.spin
            if (fire.x < -120 || fire.x > 1120 || fire.y < -120 || fire.y > 700) {
                fire.destroy()
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
