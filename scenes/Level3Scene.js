import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { addBasketballHoopVisual } from "../utils/basketballHoop.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"
import { playLevelBgm, registerLevelBgmShutdown } from "../utils/levelBgm.js"
import { setupPlayerHealthBar, syncPlayerHealthBarPosition } from "../utils/playerHealthBar.js"
import { setPlayerAirborneVisual } from "../utils/playerAirbornePose.js"
import level3BgmUrl from "../assets/level3-bgm.m4a?url"

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super("Level3Scene")
    }

    preload() {
        this.load.spritesheet("chicken", assetUrl("assets/chicken.png"), {
            frameWidth: 179,
            frameHeight: 150
        })

        this.load.image("egg", assetUrl("assets/egg.png"))
        this.load.audio("winSound", assetUrl("assets/win.mp3"))
        this.load.audio("level3Bgm", level3BgmUrl)
    }

    create() {
        this.cameras.main.setBackgroundColor("#121820")

        this.buildLevel3GymBackdrop()

        const hudTitleStyle = {
            fontSize: "30px",
            color: "#f8fafc",
            stroke: "#0f172a",
            strokeThickness: 5
        }
        const hudSubStyle = {
            fontSize: "18px",
            color: "#e2e8f0",
            stroke: "#0f172a",
            strokeThickness: 3,
            wordWrap: { width: 720 }
        }
        const hudScoreStyle = {
            fontSize: "24px",
            color: "#fef9c3",
            stroke: "#0f172a",
            strokeThickness: 4
        }

        this.add.text(20, 20, "BONUS LEVEL: Egg Hoop!", hudTitleStyle).setDepth(26)

        this.add
            .text(20, 52, "Move with arrows | UP to jump | SPACE to shoot | ESC — level select", hudSubStyle)
            .setDepth(26)

        this.score = 0
        this.targetScore = 5

        this.scoreText = this.add.text(20, 92, "Shots Made: 0 / 5", hudScoreStyle).setDepth(26)

        // Ground (physics — maple tone)
        this.ground = this.add.rectangle(500, 570, 1000, 60, 0xa47148)
        this.physics.add.existing(this.ground, true)
        this.ground.setDepth(1)

        this.drawLevel3CourtFloorAndLines()

        addBasketballHoopVisual(this)

        // Backboard and rim colliders
        this.backboardCollider = this.add.rectangle(846, 260, 26, 110, 0xffffff, 0)
        this.physics.add.existing(this.backboardCollider, true)

        this.rimLeftCollider = this.add.rectangle(776, 322, 12, 12, 0xff6600, 0)
        this.physics.add.existing(this.rimLeftCollider, true)

        this.rimRightCollider = this.add.rectangle(824, 322, 12, 12, 0xff6600, 0)
        this.physics.add.existing(this.rimRightCollider, true)

        // Player
        this.player = this.physics.add.sprite(120, 450, "chicken", 0)
        this.player.setScale(0.85)
        this.player.setCollideWorldBounds(true)
        this.player.setDepth(16)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.anims.create({
            key: "run3",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.lives = 3
        setupPlayerHealthBar(this, {
            yOffset: -80,
            bgColor: 0x1e293b,
            borderColor: 0xc9a227,
            filledColor: 0x22c55e,
            emptyColor: 0x475569,
            labelColor: "#e2e8f0"
        })
        this.refreshHealthBar()

        this.eggs = this.physics.add.group()

        /** Must match `shootEgg` so the aim preview matches the real shot. */
        this.eggShotVelocity = { x: 420, y: -300 }
        this.eggSpawnOffset = { x: 28, y: -20 }

        this.aimPreviewGfx = this.add.graphics().setDepth(12)

        this.jokes = [
            "What the cluck was that shot?!",
            "Nothing but net... and shell!",
            "Egg-cellent bucket!",
            "Buckets and beaks!",
            "Shell yeah!",
            "Cluck Jordan strikes again!",
            "That yolk had touch!",
            "Too easy. Too chicken easy.",
            "Straight out the coop!",
            "He’s heating up!"
        ]

        this.jokeBubble = this.add.rectangle(500, 130, 440, 76, 0x1e293b, 0.94)
            .setStrokeStyle(2, 0xc9a227, 1)
            .setVisible(false)
            .setDepth(1100)

        this.jokeText = this.add.text(500, 130, "", {
            fontSize: "22px",
            color: "#f8fafc",
            align: "center",
            wordWrap: { width: 400 }
        })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1100)

        registerEscToLevelSelect(this)

        playLevelBgm(this, "level3Bgm")
        registerLevelBgmShutdown(this, "level3Bgm")
    }

    buildLevel3GymBackdrop() {
        const bg = this.add.graphics().setDepth(-25)

        bg.fillStyle(0x151c28, 1)
        bg.fillRect(0, 0, 1000, 78)

        const lights = [
            [100, 26, 300, 17],
            [440, 24, 240, 15],
            [710, 28, 210, 16]
        ]
        for (const [lx, ly, lw, lh] of lights) {
            bg.fillStyle(0xfff7ed, 0.38)
            bg.fillRect(lx, ly, lw, lh)
            bg.fillStyle(0xffffff, 0.16)
            bg.fillRect(lx + 3, ly + 3, lw - 6, lh - 6)
        }

        bg.fillStyle(0x3d4a5e, 1)
        bg.fillRect(0, 78, 1000, 448)

        bg.lineStyle(1, 0x2a3342, 0.75)
        for (let x = 0; x <= 1000; x += 92) {
            bg.lineBetween(x, 78, x, 518)
        }

        bg.fillStyle(0x7f1d1d, 0.5)
        bg.fillRect(0, 318, 1000, 24)
        bg.fillStyle(0x1e3a8a, 0.5)
        bg.fillRect(0, 342, 1000, 24)

        bg.fillStyle(0x252f3f, 1)
        bg.fillRect(0, 498, 1000, 44)

        this.add
            .text(640, 132, "HOME\nCOURT", {
                fontSize: "26px",
                color: "#64748b",
                align: "center",
                lineSpacing: 2
            })
            .setOrigin(0.5)
            .setAlpha(0.38)
            .setDepth(-2)

        this.add
            .text(160, 200, "COOP\nFITNESS", {
                fontSize: "22px",
                color: "#64748b",
                align: "center"
            })
            .setOrigin(0.5)
            .setAlpha(0.28)
            .setDepth(-2)
    }

    drawLevel3CourtFloorAndLines() {
        const floor = this.add.graphics().setDepth(2)
        const top = 540
        for (let y = top; y < 602; y += 7) {
            const stripe = (y - top) % 14 === 0 ? 0x6f4a32 : 0x7d5538
            floor.fillStyle(stripe, 0.55)
            floor.fillRect(0, y, 1000, 7)
        }

        floor.lineStyle(1, 0x4a3020, 0.35)
        for (let x = 0; x < 1000; x += 40) {
            floor.lineBetween(x, top, x + 18, 598)
        }

        const paint = this.add.graphics().setDepth(2)
        paint.fillStyle(0xd97757, 0.28)
        paint.fillRect(672, 512, 318, 58)
        paint.fillStyle(0xf4a574, 0.14)
        paint.fillRect(672, 512, 318, 22)

        const lines = this.add.graphics().setDepth(3)
        lines.fillStyle(0xf8fafc, 0.95)
        lines.fillRect(0, 536, 1000, 5)

        lines.lineStyle(3, 0xf1f5f9, 0.92)
        lines.lineBetween(22, 508, 22, 598)
        lines.lineBetween(978, 508, 978, 598)

        lines.lineStyle(2, 0xf8fafc, 0.55)
        lines.strokeRect(14, 502, 972, 92)
    }

    shootEgg() {
        const ox = this.eggSpawnOffset.x
        const oy = this.eggSpawnOffset.y
        const egg = this.eggs.create(this.player.x + ox, this.player.y + oy, "egg")
        egg.setScale(0.05)
        egg.setDepth(18)
        egg.body.setAllowGravity(true)
        egg.setBounce(0.3)
        egg.body.setSize(egg.width * 0.45, egg.height * 0.45, true)

        // tracking flags
        egg.scored = false
        egg.hasPassedRimHeight = false

        egg.setVelocityX(this.eggShotVelocity.x)
        egg.setVelocityY(this.eggShotVelocity.y)

        this.physics.add.collider(egg, this.ground, () => {
            if (egg.active) egg.destroy()
        })

        this.physics.add.collider(egg, this.backboardCollider)
        this.physics.add.collider(egg, this.rimLeftCollider)
        this.physics.add.collider(egg, this.rimRightCollider)
    }

    /**
     * Ballistic path using the same integration order as Arcade: velocity += g·dt, then position += v·dt.
     * Stops at the court floor (rim/backboard bounces are not drawn).
     */
    computeEggTrajectoryPoints() {
        const g = this.physics.world.gravity
        const gx = g.x
        const gy = g.y
        const dt = 1 / 120
        const maxSteps = 280

        let x = this.player.x + this.eggSpawnOffset.x
        let y = this.player.y + this.eggSpawnOffset.y
        let vx = this.eggShotVelocity.x
        let vy = this.eggShotVelocity.y

        const pts = [{ x, y }]
        const groundTop = this.ground.body.top

        for (let i = 0; i < maxSteps; i++) {
            vy += gy * dt
            vx += gx * dt
            x += vx * dt
            y += vy * dt
            pts.push({ x, y })
            if (y >= groundTop - 4) break
            if (x > 1040 || x < -100) break
            if (y < -120) break
        }

        return pts
    }

    updateAimPreview() {
        const gfx = this.aimPreviewGfx
        if (!gfx) return

        gfx.clear()

        const pts = this.computeEggTrajectoryPoints()
        if (pts.length < 2) return

        const n = pts.length
        for (let i = 0; i < n; i += 3) {
            const t = i / Math.max(1, n - 1)
            const a = 0.52 * (1 - t * 0.55)
            gfx.fillStyle(0xfffef5, a)
            gfx.fillCircle(pts[i].x, pts[i].y, i === 0 ? 3.2 : 2.4)
        }

        gfx.lineStyle(2, 0xfffbeb, 0.38)
        gfx.beginPath()
        gfx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < n; i++) {
            gfx.lineTo(pts[i].x, pts[i].y)
        }
        gfx.strokePath()
    }

    registerScore(egg) {
        if (!egg || !egg.active || egg.scored) return

        egg.scored = true
        this.score += 1
        this.scoreText.setText(`Shots Made: ${this.score} / ${this.targetScore}`)

        const joke = Phaser.Utils.Array.GetRandom(this.jokes)
        this.showJoke(joke)

        egg.destroy()

        if (this.score >= this.targetScore) {
            if (this.sound.get("winSound")) {
                this.sound.play("winSound", { volume: 0.6 })
            }
            this.time.delayedCall(900, () => {
                this.scene.start("Level3WinScene")
            })
        }
    }

    showJoke(message) {
        this.jokeText.setText(message)
        this.jokeBubble.setVisible(true)
        this.jokeText.setVisible(true)

        this.jokeBubble.setAlpha(0)
        this.jokeText.setAlpha(0)

        this.tweens.add({
            targets: [this.jokeBubble, this.jokeText],
            alpha: 1,
            duration: 150
        })

        this.time.delayedCall(1400, () => {
            this.tweens.add({
                targets: [this.jokeBubble, this.jokeText],
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    this.jokeBubble.setVisible(false)
                    this.jokeText.setVisible(false)
                }
            })
        })
    }

    update() {
        if (goToLevelSelectIfEsc(this)) return

        syncPlayerHealthBarPosition(this)

        const onGround = this.player.body.blocked.down || this.player.body.touching.down
        const justJumped = Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround

        // movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-220)
            this.player.setFlipX(true)
            this.player.setAngle(0)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run3")) {
                this.player.play("run3", true)
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(220)
            this.player.setFlipX(false)
            this.player.setAngle(0)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run3")) {
                this.player.play("run3", true)
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

        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.shootEgg()
        }

        this.updateAimPreview()

        // reliable hoop scoring
        this.eggs.getChildren().forEach((egg) => {
            if (!egg.active || egg.scored) return

            // mark once egg has gone above the rim area
            if (egg.y < 320) {
                egg.hasPassedRimHeight = true
            }

            // score only when falling back down through hoop opening
            const insideHoopX = egg.x > 782 && egg.x < 818
            const fallingDown = egg.body.velocity.y > 0
            const belowRim = egg.y > 322 && egg.y < 360

            if (egg.hasPassedRimHeight && insideHoopX && fallingDown && belowRim) {
                this.registerScore(egg)
            }
        })
    }
}