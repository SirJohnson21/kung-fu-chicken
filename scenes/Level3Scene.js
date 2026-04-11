import Phaser from "phaser"
import { assetUrl } from "../utils/assetUrl.js"
import { addBasketballHoopVisual } from "../utils/basketballHoop.js"
import { registerEscToLevelSelect, goToLevelSelectIfEsc } from "../utils/goToLevelSelectOnEsc.js"

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
    }

    create() {
        this.cameras.main.setBackgroundColor("#87ceeb")

        this.add.text(20, 20, "BONUS LEVEL: Egg Hoop!", {
            fontSize: "30px",
            color: "#222222"
        })

        this.add.text(20, 55, "Move with arrows | UP to jump | SPACE to shoot | ESC — level select", {
            fontSize: "20px",
            color: "#222222"
        })

        this.score = 0
        this.targetScore = 3

        this.scoreText = this.add.text(20, 90, "Shots Made: 0 / 3", {
            fontSize: "24px",
            color: "#222222"
        })

        // Ground
        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x8b5a2b)
        this.physics.add.existing(this.ground, true)

        // Court line
        this.add.rectangle(500, 540, 1000, 4, 0xffffff)

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
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.anims.create({
            key: "run3",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "flap3",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
            repeat: -1
        })

        this.eggs = this.physics.add.group()

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

        this.jokeBubble = this.add.rectangle(500, 130, 420, 70, 0xffffff)
            .setStrokeStyle(3, 0x222222)
            .setVisible(false)

        this.jokeText = this.add.text(500, 130, "", {
            fontSize: "22px",
            color: "#222222",
            align: "center",
            wordWrap: { width: 380 }
        }).setOrigin(0.5).setVisible(false)

        registerEscToLevelSelect(this)
    }

    shootEgg() {
        const egg = this.eggs.create(this.player.x + 28, this.player.y - 20, "egg")
        egg.setScale(0.05)
        egg.body.setAllowGravity(true)
        egg.setBounce(0.3)
        egg.body.setSize(egg.width * 0.45, egg.height * 0.45, true)

        // tracking flags
        egg.scored = false
        egg.hasPassedRimHeight = false

        // tuned easy shot
        egg.setVelocityX(420)
        egg.setVelocityY(-300)

        this.physics.add.collider(egg, this.ground, () => {
            if (egg.active) egg.destroy()
        })

        this.physics.add.collider(egg, this.backboardCollider)
        this.physics.add.collider(egg, this.rimLeftCollider)
        this.physics.add.collider(egg, this.rimRightCollider)
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
                this.player.setFrame(3)
                this.player.setAngle(-10)
                this.player.play("flap3", true)
            }
        }

        if (!onGround) {
            // Pose tilt to make jumping/falling readable.
            this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "flap3") this.player.play("flap3", true)
        }

        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.shootEgg()
        }

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