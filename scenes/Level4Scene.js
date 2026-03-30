import Phaser from "phaser"

export default class Level4Scene extends Phaser.Scene {
    constructor() {
        super("Level4Scene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 179,
            frameHeight: 150
        })

        this.load.image("egg", "assets/egg.png")
        this.load.image("enemy", "assets/enemy.png")

        this.load.audio("quoteSound", "assets/quote.mp3")
        this.load.audio("kickSound", "assets/kick.mp3")
        this.load.audio("hitSound", "assets/hit.mp3")
        this.load.audio("winSound", "assets/win.mp3")
    }

    create() {
        this.cameras.main.setBackgroundColor("#040016")

        // Atari-ish scanlines + grid
        this.drawAtariBackground()

        this.add.text(20, 20, "LEVEL 4: POSITIVITY FLOW", {
            fontSize: "26px",
            color: "#00ffcc"
        })

        this.add.text(20, 52, "Collect positivity (eggs) • Avoid negativity (stress) • X kick", {
            fontSize: "18px",
            color: "#7fffd4"
        })

        // Ground
        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x0b3d2e)
        this.physics.add.existing(this.ground, true)

        // Player
        this.player = this.physics.add.sprite(120, 450, "chicken", 0)
        this.player.setScale(0.85)
        this.player.setCollideWorldBounds(true)
        this.player.setAngle(0)
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
            key: "flap4",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
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

        // Positivity stream
        this.targetPositives = 8
        this.positiveCount = 0
        this.positiveText = this.add.text(20, 90, `Positivity: 0 / ${this.targetPositives}`, {
            fontSize: "22px",
            color: "#eaffff"
        })

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

        // Spawners
        this.positiveSpawn = this.time.addEvent({
            delay: 350,
            callback: this.spawnPositive,
            loop: true
        })

        this.stressSpawn = this.time.addEvent({
            delay: 900,
            callback: this.spawnStress,
            loop: true
        })
    }

    drawAtariBackground() {
        const width = 1000
        const height = 600

        // Grid
        const grid = this.add.graphics()
        grid.lineStyle(1, 0x10255a, 0.5)

        for (let x = 0; x <= width; x += 50) {
            grid.beginPath()
            grid.moveTo(x, 0)
            grid.lineTo(x, height)
            grid.strokePath()
        }

        for (let y = 0; y <= height; y += 50) {
            grid.beginPath()
            grid.moveTo(0, y)
            grid.lineTo(width, y)
            grid.strokePath()
        }

        // Scanlines overlay
        const scan = this.add.graphics()
        scan.fillStyle(0x000000, 0.12)
        for (let y = 0; y < height; y += 4) {
            scan.fillRect(0, y, width, 1)
        }

        // Subtle flicker
        this.time.addEvent({
            delay: 120,
            callback: () => {
                grid.setAlpha(Phaser.Math.FloatBetween(0.35, 0.65))
            },
            loop: true
        })
    }

    spawnPositive = () => {
        if (this.isWin || this.isGameOver) return

        const y = Phaser.Math.Between(200, 520)
        const orb = this.positives.create(1050, y, "egg")
        orb.setScale(0.06 + Math.random() * 0.01)
        orb.setTint(0x00ff88)
        orb.body.setAllowGravity(false)
        orb.body.setVelocityX(-Phaser.Math.Between(130, 220))

        // Flow motion (wavy y)
        orb.flowBaseY = y
        orb.flowAmp = Phaser.Math.Between(8, 18)
        orb.flowSpeed = Phaser.Math.FloatBetween(0.8, 1.4)
        orb.flowPhase = Phaser.Math.FloatBetween(0, Math.PI * 2)

        // Shrink collision area for nicer feel
        orb.body.setSize(orb.width * 0.35, orb.height * 0.35, true)
    }

    spawnStress = () => {
        if (this.isWin || this.isGameOver) return

        const y = Phaser.Math.Between(200, 520)
        const bot = this.stress.create(1050, y, "enemy")
        bot.setScale(0.085)
        bot.body.setAllowGravity(false)
        bot.body.setVelocityX(-Phaser.Math.Between(170, 260))

        bot.flowBaseY = y
        bot.flowAmp = Phaser.Math.Between(10, 22)
        bot.flowSpeed = Phaser.Math.FloatBetween(0.7, 1.2)
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

        this.spawnSparkBurst(orb.x, orb.y, 0x00ff99)

        if (this.positiveCount >= this.targetPositives) {
            this.completeLevel()
        }
    }

    hitStress(player, bot) {
        if (this.isWin || this.isGameOver) return
        if (!bot || !bot.active) return
        if (this.isKicking) return

        this.isGameOver = true

        if (this.sound.get("hitSound")) {
            this.sound.play("hitSound", { volume: 0.6 })
        }

        this.time.delayedCall(220, () => {
            this.scene.restart()
        })
    }

    kickNegativity() {
        const kickRange = 120
        const kickImpulse = 320

        this.stress.getChildren().forEach((bot) => {
            if (!bot.active) return

            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                bot.x,
                bot.y
            )
            if (distance > kickRange) return

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
                    // Keep flap pose while airborne.
                    this.player.play("flap4", true)
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

        // Jump
        if (this.cursors.up.isDown && onGround) {
            this.player.setVelocityY(-420)

            // Jump immediately into the pose so it looks snappy.
            this.player.setFrame(3)
            this.player.play("flap4", true)
            this.player.setAngle(-10)
        }

        // Air pose tilt
        if (!onGround) {
            this.player.play("flap4", true)
            this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
        }
    }
}

