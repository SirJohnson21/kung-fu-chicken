import Phaser from "phaser"

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super("Level2Scene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 256,
            frameHeight: 512
        })

        this.load.image("enemy", "assets/enemy.png")
        this.load.image("egg", "assets/egg.png")

        this.load.audio("quoteSound", "assets/quote.mp3")
        this.load.audio("eggSound", "assets/egg-collect.mp3")
        this.load.audio("kickSound", "assets/kick.mp3")
        this.load.audio("hitSound", "assets/hit.mp3")
        this.load.audio("winSound", "assets/win.mp3")
    }

    create() {
        this.cameras.main.setBackgroundColor("#d9e6f2")

        this.add.text(20, 20, "LEVEL 2: Office Positivity", {
            fontSize: "28px",
            color: "#222222"
        })

        this.add.text(20, 55, "Collect quotes and eggs | Avoid stress | X to kick", {
            fontSize: "20px",
            color: "#444444"
        })

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x8b6b4a)
        this.physics.add.existing(this.ground, true)

        this.platforms = this.physics.add.staticGroup()
        const deskPlatform = this.add.rectangle(700, 455, 140, 20, 0x555555)
        this.physics.add.existing(deskPlatform, true)
        this.platforms.add(deskPlatform)

        this.leftDesk = this.add.rectangle(160, 470, 140, 70, 0x777777)
        this.rightDesk = this.add.rectangle(700, 470, 140, 70, 0x777777)

        this.add.rectangle(160, 420, 70, 40, 0x99ccff)
        this.add.rectangle(700, 420, 70, 40, 0x99ccff)

        this.player = this.physics.add.sprite(100, 450, "chicken", 1)
        this.player.setScale(0.25)
        this.player.setCollideWorldBounds(true)

        this.physics.add.collider(this.player, this.ground)
        this.physics.add.collider(this.player, this.platforms)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)

        this.anims.create({
            key: "run2",
            frames: this.anims.generateFrameNumbers("chicken", { start: 1, end: 4 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "flap2",
            frames: this.anims.generateFrameNumbers("chicken", { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        })

        this.player.setFrame(1)
        this.isKicking = false

        this.itemsCollected = 0
        this.totalItems = 4

        this.itemCounter = this.add.text(20, 90, "Collected: 0 / 4", {
            fontSize: "24px",
            color: "#222222"
        })

        this.quotePickups = this.physics.add.staticGroup()

        const quote1 = this.quotePickups.create(260, 525, null)
        quote1.setSize(40, 40)
        quote1.setVisible(false)
        quote1.visual = this.add.rectangle(260, 525, 36, 36, 0xffffff).setStrokeStyle(2, 0x222222)
        quote1.mark = this.add.text(252, 512, '"', { fontSize: "28px", color: "#222222" })

        const quote2 = this.quotePickups.create(520, 525, null)
        quote2.setSize(40, 40)
        quote2.setVisible(false)
        quote2.visual = this.add.rectangle(520, 525, 36, 36, 0xffffff).setStrokeStyle(2, 0x222222)
        quote2.mark = this.add.text(512, 512, '"', { fontSize: "28px", color: "#222222" })

        const quote3 = this.quotePickups.create(810, 525, null)
        quote3.setSize(40, 40)
        quote3.setVisible(false)
        quote3.visual = this.add.rectangle(810, 525, 36, 36, 0xffffff).setStrokeStyle(2, 0x222222)
        quote3.mark = this.add.text(802, 512, '"', { fontSize: "28px", color: "#222222" })

        this.physics.add.overlap(this.player, this.quotePickups, this.collectQuote, null, this)

        this.deskEgg = this.physics.add.staticSprite(700, 390, "egg")
        this.deskEgg.setScale(0.06).refreshBody()

        this.tweens.add({
            targets: this.deskEgg,
            y: 380,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })

        this.physics.add.overlap(this.player, this.deskEgg, this.collectDeskEgg, null, this)

        this.quoteBubble = this.add.rectangle(0, 0, 220, 60, 0xffffff)
            .setStrokeStyle(2, 0x222222)
            .setVisible(false)

        this.quoteText = this.add.text(0, 0, "", {
            fontSize: "18px",
            color: "#222222",
            align: "center",
            wordWrap: { width: 200 }
        }).setOrigin(0.5).setVisible(false)

        this.quotes = [
            "Keep going.",
            "Progress beats perfection.",
            "Breathe. Reset. Rise."
        ]

        this.enemy = this.physics.add.sprite(620, 530, "enemy")
        this.enemy.setScale(0.08)
        this.enemy.setCollideWorldBounds(true)
        this.enemy.body.setAllowGravity(false)
        this.enemy.body.setImmovable(true)
        this.enemy.body.setSize(140, 140)
        this.enemy.body.setOffset(30, 30)
        this.enemySpeed = 180
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

    collectQuote(player, pickup) {
        if (pickup.visual) pickup.visual.destroy()
        if (pickup.mark) pickup.mark.destroy()
        pickup.destroy()

        this.itemsCollected += 1
        this.itemCounter.setText(`Collected: ${this.itemsCollected} / ${this.totalItems}`)

        const quoteIndex = Math.min(this.itemsCollected - 1, this.quotes.length - 1)
        const quote = this.quotes[quoteIndex]

        if (quote) {
            this.showQuote(quote)
        }

        if (this.sound.get("quoteSound")) {
            this.sound.play("quoteSound", { volume: 0.5 })
        }

        this.checkLevelComplete()
    }

    collectDeskEgg(player, egg) {
        egg.destroy()

        this.itemsCollected += 1
        this.itemCounter.setText(`Collected: ${this.itemsCollected} / ${this.totalItems}`)

        this.showQuote("A little reward for the hard work.")

        if (this.sound.get("eggSound")) {
            this.sound.play("eggSound", { volume: 0.5 })
        }

        this.checkLevelComplete()
    }

    checkLevelComplete() {
        if (this.itemsCollected >= this.totalItems) {
            if (this.sound.get("winSound")) {
                this.sound.play("winSound", { volume: 0.6 })
            }

            this.time.delayedCall(500, () => {
                this.scene.start("Level2WinScene")
            })
        }
    }

    showQuote(message) {
        this.quoteText.setText(message)

        this.quoteBubble.setVisible(true)
        this.quoteText.setVisible(true)

        this.quoteBubble.setAlpha(0)
        this.quoteText.setAlpha(0)

        this.tweens.add({
            targets: [this.quoteBubble, this.quoteText],
            alpha: 1,
            duration: 200
        })

        this.time.delayedCall(1600, () => {
            this.tweens.add({
                targets: [this.quoteBubble, this.quoteText],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.quoteBubble.setVisible(false)
                    this.quoteText.setVisible(false)
                }
            })
        })
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

        if (this.enemy.x >= 900) {
            this.enemy.body.setVelocityX(-this.enemySpeed)
            this.enemy.setFlipX(true)
        } else if (this.enemy.x <= 500) {
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

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run2")) {
                    this.player.play("run2")
                }
            }
            else if (this.cursors.right.isDown) {
                this.player.setVelocityX(220)
                this.player.setFlipX(false)

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "run2")) {
                    this.player.play("run2")
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
                if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "flap2") {
                    this.player.play("flap2")
                }
            }
        }

        if (this.quoteBubble.visible) {
            this.quoteBubble.x = this.player.x
            this.quoteBubble.y = this.player.y - 80

            this.quoteText.x = this.player.x
            this.quoteText.y = this.player.y - 80
        }
    }
}