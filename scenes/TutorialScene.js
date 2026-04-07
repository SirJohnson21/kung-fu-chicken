import Phaser from "phaser"

export default class TutorialScene extends Phaser.Scene {
    constructor() {
        super("TutorialScene")
    }

    preload() {
        this.load.spritesheet("chicken", "assets/chicken.png", {
            frameWidth: 179,
            frameHeight: 150
        })
        this.load.audio("kickSound", "assets/kick.mp3")
    }

    create() {
        this.cameras.main.setBackgroundColor("#222")

        this.add
            .text(500, 36, "HOW TO MOVE & KICK", {
                fontSize: "36px",
                color: "#ffffff"
            })
            .setOrigin(0.5)

        this.add
            .text(500, 78, "Practice below. Face the way you kick. Press SPACE when you are ready to pick a level.", {
                fontSize: "18px",
                color: "#b8b8b8"
            })
            .setOrigin(0.5)

        this.ground = this.add.rectangle(500, 570, 1000, 60, 0x654321)
        this.physics.add.existing(this.ground, true)

        this.player = this.physics.add.sprite(500, 450, "chicken", 0)
        this.player.setScale(0.85)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.ground)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

        this.anims.create({
            key: "tut_run",
            frames: this.anims.generateFrameNumbers("chicken", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: "tut_flap",
            frames: this.anims.generateFrameNumbers("chicken", { start: 3, end: 5 }),
            frameRate: 14,
            repeat: -1
        })

        this.anims.create({
            key: "tut_kick",
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

        this.flags = { left: false, right: false, jump: false, kick: false }

        const lineStyle = { fontSize: "22px", color: "#cccccc" }
        this.lineMove = this.add.text(40, 118, "○  ← →  Move left and right", lineStyle)
        this.lineJump = this.add.text(40, 152, "○  ↑  Jump", lineStyle)
        this.lineKick = this.add.text(40, 186, "○  X  Kick (try it once)", lineStyle)

        this.hintReady = this.add
            .text(500, 528, "SPACE — choose a level   ·   ESC — title screen", {
                fontSize: "20px",
                color: "#ffff88"
            })
            .setOrigin(0.5)

        this.refreshChecklist()
        this._checkSig = "0000"
    }

    refreshChecklist() {
        const done = "#88ffaa"
        const todo = "#cccccc"
        const mk = (ok, label) => (ok ? `✓  ${label}` : `○  ${label}`)

        this.lineMove.setColor(this.flags.left && this.flags.right ? done : todo)
        this.lineMove.setText(
            mk(this.flags.left && this.flags.right, "← →  Move left and right")
        )

        this.lineJump.setColor(this.flags.jump ? done : todo)
        this.lineJump.setText(mk(this.flags.jump, "↑  Jump"))

        this.lineKick.setColor(this.flags.kick ? done : todo)
        this.lineKick.setText(mk(this.flags.kick, "X  Kick (try it once)"))

        const all = this.flags.left && this.flags.right && this.flags.jump && this.flags.kick
        this.hintReady.setColor(all ? "#aaffcc" : "#ffff88")
        if (all) {
            this.hintReady.setText("Nice! SPACE — choose a level   ·   ESC — title screen")
        } else {
            this.hintReady.setText("SPACE — choose a level   ·   ESC — title screen")
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            this.scene.start("LevelSelectScene")
            return
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
            this.scene.start("MenuScene")
            return
        }

        const onGround = this.player.body.blocked.down || this.player.body.touching.down
        const justJumped = Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround

        if (this.cursors.left?.isDown) this.flags.left = true
        if (this.cursors.right?.isDown) this.flags.right = true
        if (justJumped || (!onGround && this.player.body.velocity.y < -50)) {
            this.flags.jump = true
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.flags.kick = true
            this.isKicking = true
            this.player.anims.stop()
            this.player.setVelocityX(0)
            this.player.setAngle(this.player.flipX ? 18 : -18)
            this.player.play("tut_kick", true)

            if (this.sound.get("kickSound")) {
                this.sound.play("kickSound", { volume: 0.45 })
            }

            this.time.delayedCall(180, () => {
                this.isKicking = false
                this.player.setAngle(0)
                if (this.player.body.blocked.down || this.player.body.touching.down) {
                    this.player.anims.stop()
                    this.player.setFrame(0)
                }
            })

            this.syncChecklist()
            return
        }

        if (!this.isKicking) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-220)
                this.player.setFlipX(true)
                this.player.setAngle(0)
                this.flags.left = true

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "tut_run")) {
                    this.player.play("tut_run")
                }
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(220)
                this.player.setFlipX(false)
                this.player.setAngle(0)
                this.flags.right = true

                if (onGround && (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "tut_run")) {
                    this.player.play("tut_run")
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
                    this.flags.jump = true
                    this.player.setFrame(3)
                    this.player.setAngle(-10)
                    this.player.play("tut_flap", true)
                }
            }

            if (!onGround) {
                this.player.setAngle(this.player.body.velocity.y < 0 ? -10 : 10)
                if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "tut_flap") {
                    this.player.play("tut_flap", true)
                }
            }
        }

        this.syncChecklist()
    }

    syncChecklist() {
        const sig = `${this.flags.left}${this.flags.right}${this.flags.jump}${this.flags.kick}`
        if (sig !== this._checkSig) {
            this._checkSig = sig
            this.refreshChecklist()
        }
    }
}
