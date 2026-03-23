import Phaser from "phaser"

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super("Level3Scene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 256,
            frameHeight: 512
        })

        this.load.image("egg", "assets/egg.png")
    }

    create() {
        this.cameras.main.setBackgroundColor("#87ceeb")

        this.add.text(20, 20, "BONUS LEVEL: Egg Hoop!", {
            fontSize: "30px",
            color: "#222222"
        })

        this.add.text(20, 55, "Move with arrows | UP to jump | SPACE to shoot", {
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

        // Hoop stand
        this.add.rectangle(860, 390, 20, 220, 0x444444)

        // Visual backboard
        this.add.rectangle(855, 260, 14, 90, 0xffffff)

        // Visual rim
        this.add.rectangle(800, 320, 60, 4, 0xff6600)

        // Net visuals
        this.add.line(780, 335, 0, 0, -12, 30, 0xffffff).setLineWidth(2, 2)
        this.add.line(790, 335, 0, 0, -6, 30, 0xffffff).setLineWidth(2, 2)
        this.add.line(800, 335, 0, 0, 0, 30, 0xffffff).setLineWidth(2, 2)
        this.add.line(810, 335, 0, 0, 6, 30, 0xffffff).setLineWidth(2, 2)
        this.add.line(820, 335, 0, 0, 12, 30, 0xffffff).setLineWidth(2, 2)

        // Backboard and rim colliders
        this.backboardCollider = this.add.rectangle(846, 260, 26, 110, 0xffffff, 0)
        this.physics.add.existing(this.backboardCollider, true)

        this.rimLeftCollider = this.add.rectangle(776, 322, 12, 12, 0xff6600, 0)
        this.physics.add.existing(this.rimLeftCollider, true)

        this.rimRightCollider = this.add.rectangle(824, 322, 12, 12, 0xff6600, 0)
        this.physics.add.existing(this.rimRightCollider, true)

        // Player
        this.player = this.physics.add.sprite(120, 450, "chicken", 1)
        this.player.setScale(0.25)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.anims.create({
            key: "run3",
            frames: this.anims.generateFrameNumbers("chicken", { start: 1, end: 4 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "flap3",
            frames: this.anims.generateFrameNumbers("chicken", { start: 4, end: 5 }),
            frameRate: 10,
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
            this.time.delayedCall(1500, () => {
                this.scene.start("MenuScene")
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
        const onGround = this.player.body.blocked.down || this.player.body.touching.down

        // movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-220)
            this.player.setFlipX(true)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run3")) {
                this.player.play("run3", true)
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(220)
            this.player.setFlipX(false)

            if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run3")) {
                this.player.play("run3", true)
            }
        } else {
            this.player.setVelocityX(0)

            if (onGround) {
                this.player.anims.stop()
                this.player.setFrame(1)
            }
        }

        if (this.cursors.up.isDown && onGround) {
            this.player.setVelocityY(-420)
        }

        if (!onGround) {
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "flap3") {
                this.player.play("flap3", true)
            }
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