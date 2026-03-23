import Phaser from "phaser"

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        super("Level1Scene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 256,
            frameHeight: 512
        })

        this.load.image("egg", "assets/egg.png")
        this.load.image("enemy", "assets/enemy.png")

        this.load.audio("eggSound", "assets/egg-collect.mp3")
        this.load.audio("kickSound", "assets/kick.mp3")
        this.load.audio("hitSound", "assets/hit.mp3")
        this.load.audio("winSound", "assets/win.mp3")
    }

    create() {
        this.add.text(20, 20, "Arrow keys to move | UP to jump | X to kick", {
            fontSize: "24px",
            color: "#ffffff"
        })

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x654321)
        this.physics.add.existing(this.ground, true)

        this.player = this.physics.add.sprite(120, 450, "chicken", 1)
        this.player.setScale(0.25)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("chicken", { start: 1, end: 4 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "flap",
            frames: this.anims.generateFrameNumbers("chicken", { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        })

        this.player.setFrame(1)
        this.isKicking = false

        // Eggs
        this.goodiesCollected = 0
        this.totalGoodies = 3

        this.goodieText = this.add.text(20, 55, "Eggs: 0 / 3", {
            fontSize: "24px",
            color: "#ffff00"
        })

        this.goodies = this.physics.add.staticGroup()
        this.goodies.create(300, 525, "egg").setScale(0.07).refreshBody()
        this.goodies.create(550, 525, "egg").setScale(0.07).refreshBody()
        this.goodies.create(800, 525, "egg").setScale(0.07).refreshBody()

        this.physics.add.overlap(this.player, this.goodies, this.collectGoodie, null, this)

        this.tweens.add({
            targets: this.goodies.getChildren(),
            y: "-=10",
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        // Enemy
        this.enemy = this.physics.add.sprite(500, 530, "enemy")
        this.enemy.setScale(0.08)
        this.enemy.setCollideWorldBounds(true)
        this.enemy.body.setAllowGravity(false)
        this.enemy.body.setImmovable(true)

        this.enemy.body.setSize(140, 140)
        this.enemy.body.setOffset(30, 30)

        this.enemySpeed = 200
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
    }

    collectGoodie(player, goodie) {
        goodie.destroy()

        if (this.sound.get("eggSound")) {
            this.sound.play("eggSound", { volume: 0.5 })
        }

        this.goodiesCollected += 1
        this.goodieText.setText(`Eggs: ${this.goodiesCollected} / ${this.totalGoodies}`)

        if (this.goodiesCollected >= this.totalGoodies) {
            if (this.sound.get("winSound")) {
                this.sound.play("winSound", { volume: 0.6 })
            }

            this.time.delayedCall(400, () => {
                this.scene.start("WinScene")
            })
        }
    }

    hitEnemy() {
        if (!this.isKicking) {
            if (this.sound.get("hitSound")) {
                this.sound.play("hitSound", { volume: 0.6 })
            }

            this.time.delayedCall(150, () => {
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

        if (distance < 90) {
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
        const onGround = this.player.body.blocked.down || this.player.body.touching.down

        if (this.enemy.x >= 850) {
            this.enemy.body.setVelocityX(-this.enemySpeed)
            this.enemy.setFlipX(true)
        } else if (this.enemy.x <= 350) {
            this.enemy.body.setVelocityX(this.enemySpeed)
            this.enemy.setFlipX(false)
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.isKicking = true
            this.player.anims.stop()
            this.player.setFrame(5)
            this.player.setVelocityX(0)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.5 })
            }

            this.kickEnemy()

            this.time.delayedCall(180, () => {
                this.isKicking = false
            })

            return
        }

        if (!this.isKicking) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-220)
                this.player.setFlipX(true)

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run")) {
                    this.player.play("run")
                }
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(220)
                this.player.setFlipX(false)

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run")) {
                    this.player.play("run")
                }
            }
            else {
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
                if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "flap") {
                    this.player.play("flap")
                }
            }
        }
    }
}