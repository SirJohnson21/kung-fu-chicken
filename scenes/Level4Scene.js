import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { playLevelBgm, registerLevelBgmShutdown } from "../utils/levelBgm.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import { addLevel4SumoRingGraphics, addLevel4SumoBannerText } from "../utils/level4SumoBackdrop.js"
import { PLAYER_KICK_RANGE_PX } from "../utils/playerKickRange.js"
import { setPlayerAirborneVisual } from "../utils/playerAirbornePose.js"
import level4BgmUrl from "../assets/level4-bgm.m4a?url"

export default class Level4Scene extends Phaser.Scene {
    constructor() {
        super("Level4Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })

        this.load.image("egg", assetUrl("assets/egg.png"))
        this.load.image("enemy", assetUrl("assets/enemy.png"))

        this.load.audio("quoteSound", assetUrl("assets/quote.mp3"))
        this.load.audio("kickSound", assetUrl("assets/kick.mp3"))
        this.load.audio("hitSound", assetUrl("assets/hit.mp3"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level4Bgm", level4BgmUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#2a1810")

        addLevel4SumoRingGraphics(this)
        addLevel4SumoBannerText(this, "Dohyō — keep the good vibes in the ring")

        const hudTitle = {
            fontSize: "26px",
            color: "#fef3c7",
            stroke: "#450a0a",
            strokeThickness: 5
        }
        const hudSub = {
            fontSize: "18px",
            color: "#fde68a",
            stroke: "#431407",
            strokeThickness: 3,
            wordWrap: { width: 780 }
        }
        const hudScore = {
            fontSize: "22px",
            color: "#fffbeb",
            stroke: "#451a03",
            strokeThickness: 4
        }

        this.add.text(20, 20, "LEVEL 4: POSITIVITY FLOW", hudTitle).setDepth(30)

        this.add
            .text(20, 52, "Collect 15 positivity (eggs) • Avoid stress • X kick • ESC — level select", hudSub)
            .setDepth(30)

        // Ground — clay ring extension (dohyō)
        this.ground = this.add.rectangle(500, 570, 1000, 60, 0xc9b896)
        this.physics.add.existing(this.ground, true)
        this.ground.setDepth(1)

        // Player
        this.player = this.physics.add.sprite(120, 450, "chicken", 0)
        this.player.setScale(0.85)
        this.player.setCollideWorldBounds(true)
        this.player.setAngle(0)
        this.player.setDepth(20)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        // Animations (reuse frame ranges from earlier levels)
        this.anims.create({
            key: "run4",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "kick4",
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
        this.isWin = false
        this.isGameOver = false
        this.lives = 3
        this.invulnerableUntil = 0
        this.hasShownKickTip = false

        // Positivity stream
        this.targetPositives = 15
        this.positiveCount = 0
        this.positiveText = this.add
            .text(20, 92, `Positivity: 0 / ${this.targetPositives}`, hudScore)
            .setDepth(30)

        // Groups
        this.positives = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })
        this.stress = this.physics.add.group({
            allowGravity: false,
            immovable: false
        })

        this.physics.add.overlap(this.player, this.positives, this.collectPositive, null, this)
        this.physics.add.overlap(this.player, this.stress, this.hitStress, null, this)

        setupPlayerHealthBar(this, {
            yOffset: -82,
            bgColor: 0x450a0a,
            borderColor: 0xc9a227,
            filledColor: 0x22c55e,
            emptyColor: 0x78350f,
            labelColor: "#fef3c7"
        })
        this.refreshHealthBar()

        this.kickTipBubble = this.add.rectangle(0, 0, 190, 46, 0x7f1d1d, 0.94)
            .setStrokeStyle(2, 0xc9a227, 1)
            .setVisible(false)
            .setDepth(1100)
        this.kickTipText = this.add.text(0, 0, "Kick it!", {
            fontSize: "20px",
            color: "#fef3c7",
            stroke: "#431407",
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1101)

        // Spawners
        this.positiveSpawn = this.time.addEvent({
            delay: 470,
            callback: this.spawnPositive,
            loop: true
        })

        this.stressSpawn = this.time.addEvent({
            delay: 1250,
            callback: this.spawnStress,
            loop: true
        })

        registerEscToLevelSelect(this)

        playLevelBgm(this, "level4Bgm")
        registerLevelBgmShutdown(this, "level4Bgm")
    }

    spawnPositive = () => {
        if (this.isWin || this.isGameOver) return

        const y = Phaser.Math.Between(200, 520)
        const orb = this.positives.create(1050, y, "egg")
        orb.setScale(0.06 + Math.random() * 0.01)
        orb.setTint(0x4ade80)
        orb.setDepth(8)
        orb.body.setAllowGravity(false)
        orb.body.setVelocityX(-Phaser.Math.Between(95, 155))

        // Flow motion (wavy y)
        orb.flowBaseY = y
        orb.flowAmp = Phaser.Math.Between(6, 14)
        orb.flowSpeed = Phaser.Math.FloatBetween(0.55, 1.0)
        orb.flowPhase = Phaser.Math.FloatBetween(0, Math.PI * 2)

        // Shrink collision area for nicer feel
        orb.body.setSize(orb.width * 0.35, orb.height * 0.35, true)
    }

    spawnStress = () => {
        if (this.isWin || this.isGameOver) return

        const y = Phaser.Math.Between(200, 520)
        const bot = this.stress.create(1050, y, "enemy")
        bot.setScale(0.085)
        bot.setDepth(8)
        bot.body.setAllowGravity(false)
        bot.body.setVelocityX(-Phaser.Math.Between(120, 180))

        bot.flowBaseY = y
        bot.flowAmp = Phaser.Math.Between(8, 16)
        bot.flowSpeed = Phaser.Math.FloatBetween(0.5, 0.95)
        bot.flowPhase = Phaser.Math.FloatBetween(0, Math.PI * 2)

        bot.body.setSize(bot.width * 0.45, bot.height * 0.45, true)
    }

    collectPositive(player, orb) {
        if (this.isWin || this.isGameOver) return
        if (!orb || !orb.active) return

        orb.destroy()
        this.positiveCount += 1
        this.positiveText.setText(`Positivity: ${this.positiveCount} / ${this.targetPositives}`)

        if (this.sound.get("quoteSound")) {
            this.sound.play("quoteSound", { volume: 0.35 })
        }

        this.spawnSparkBurst(orb.x, orb.y, 0xfbbf24)

        if (this.positiveCount >= this.targetPositives) {
            this.completeLevel()
        }
    }

    hitStress(player, bot) {
        if (this.isWin || this.isGameOver) return
        if (!bot || !bot.active) return
        if (this.isKicking) return
        if (this.time.now < this.invulnerableUntil) return

        bot.destroy()

        if (this.sound.get("hitSound")) {
            this.sound.play("hitSound", { volume: 0.6 })
        }

        this.lives -= 1
        this.refreshHealthBar()
        this.invulnerableUntil = this.time.now + 900
        this.cameras.main.flash(160, 255, 210, 120, false)
        if (!this.hasShownKickTip) {
            this.hasShownKickTip = true
            this.showKickTip()
        }

        if (this.lives <= 0) {
            this.isGameOver = true
            this.time.delayedCall(220, () => {
                this.scene.restart()
            })
        }
    }

    showKickTip() {
        const tipX = this.player.x
        const tipY = this.player.y - 130
        this.kickTipBubble.setPosition(tipX, tipY)
        this.kickTipText.setPosition(tipX, tipY)
        this.kickTipBubble.setAlpha(0)
        this.kickTipText.setAlpha(0)
        this.kickTipBubble.setVisible(true)
        this.kickTipText.setVisible(true)

        this.tweens.add({
            targets: [this.kickTipBubble, this.kickTipText],
            alpha: 1,
            duration: 150
        })

        this.time.delayedCall(1200, () => {
            this.tweens.add({
                targets: [this.kickTipBubble, this.kickTipText],
                alpha: 0,
                duration: 280,
                onComplete: () => {
                    this.kickTipBubble.setVisible(false)
                    this.kickTipText.setVisible(false)
                }
            })
        })
    }

    kickNegativity() {
        const kickImpulse = 320

        this.stress.getChildren().forEach((bot) => {
            if (!bot.active) return

            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                bot.x,
                bot.y
            )
            if (distance > PLAYER_KICK_RANGE_PX) return

            const enemyIsLeft = bot.x < this.player.x
            const enemyIsRight = bot.x > this.player.x

            // Mirror the earlier "face the enemy first" behavior.
            if (this.player.flipX && enemyIsLeft) {
                bot.x -= 80
                bot.body.setVelocityX(-kickImpulse)
            } else if (!this.player.flipX && enemyIsRight) {
                bot.x += 80
                bot.body.setVelocityX(kickImpulse)
            } else {
                // If they are close but behind you, do a light bump.
                bot.body.setVelocityX(bot.body.velocity.x * -0.15)
            }
        })
    }

    spawnSparkBurst(x, y, color) {
        // Small arcade burst of dots (no extra assets).
        const dots = []
        for (let i = 0; i < 14; i++) {
            const dot = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.95)
            dot.setDepth(10)
            dots.push(dot)
        }

        dots.forEach((dot, i) => {
            const angle = Phaser.Math.DegToRad(i * 25)
            const speed = Phaser.Math.Between(90, 180)

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: Phaser.Math.Between(240, 520),
                onComplete: () => dot.destroy()
            })
        })
    }

    completeLevel() {
        if (this.isWin || this.isGameOver) return

        this.isWin = true

        if (this.positiveSpawn) this.positiveSpawn.remove(false)
        if (this.stressSpawn) this.stressSpawn.remove(false)

        // Freeze hazards.
        this.stress.getChildren().forEach((bot) => {
            if (!bot.active) return
            bot.body.setVelocityX(0)
        })

        this.player.setVelocityX(0)
        this.player.anims.stop()
        this.player.setFrame(3)
        this.player.setAngle(-10)

        if (this.sound.get("winSound")) {
            this.sound.play("winSound", { volume: 0.55 })
        }

        this.time.delayedCall(900, () => {
            this.scene.start("Level4WinScene")
        })
    }

    update() {
        if (goToLevelSelectIfEsc(this)) return

        syncPlayerHealthBarPosition(this)
        this.player.setAlpha(this.time.now < this.invulnerableUntil ? 0.5 : 1)

        const onGround = this.player.body.blocked.down || this.player.body.touching.down

        // Update flowing objects (wavy motion)
        const t = this.time.now

        this.positives.getChildren().forEach((orb) => {
            if (!orb.active) return
            const newY = orb.flowBaseY + Math.sin(t * 0.004 * orb.flowSpeed + orb.flowPhase) * orb.flowAmp
            orb.setY(newY)
            if (orb.x < -120) orb.destroy()
        })

        this.stress.getChildren().forEach((bot) => {
            if (!bot.active) return
            const newY = bot.flowBaseY + Math.sin(t * 0.004 * bot.flowSpeed + bot.flowPhase) * bot.flowAmp
            bot.setY(newY)
            if (bot.x < -140) bot.destroy()
        })

        if (this.isWin || this.isGameOver) return

        if (Phaser.Input.Keyboard.JustDown(this.kickKey) && !this.isKicking) {
            this.isKicking = true
            this.player.setVelocityX(0)
            this.player.anims.stop()
            this.player.play("kick4", true)
            this.player.setAngle(this.player.flipX ? 18 : -18)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.5 })
            }

            this.kickNegativity()

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

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-220)
            this.player.setFlipX(true)
            this.player.setAngle(0)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run4")) {
                this.player.play("run4", true)
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(220)
            this.player.setFlipX(false)
            this.player.setAngle(0)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run4")) {
                this.player.play("run4", true)
            }
        } else {
            this.player.setVelocityX(0)

            if (onGround) {
                this.player.anims.stop()
                this.player.setFrame(0)
                this.player.setAngle(0)
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
            this.player.setVelocityY(-420)
            this.player.setAngle(-10)
            setPlayerAirborneVisual(this.player)
        }

        if (!onGround) {
            this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
            setPlayerAirborneVisual(this.player)
        }
    }
}

