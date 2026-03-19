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
    }

    create() {
        this.add.text(20, 20, "Arrow keys to move | UP to jump", {
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
    }

    update() {
        const onGround = this.player.body.blocked.down || this.player.body.touching.down

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