import Phaser from "phaser"

/**
 * Show an in-scene "3, 2, 1, GO!" overlay that pauses physics, input, and timers
 * while it runs, then cleanly restores everything. Use this from a gameplay
 * scene's `create()` so the level itself is already drawn behind the countdown
 * (no separate countdown scene needed).
 *
 * Driven by the scene's own `update` event so it works even though
 * `scene.time.paused` is set (which keeps any spawn timers from ticking).
 *
 * @param {Phaser.Scene} scene
 * @param {{ from?: number, depth?: number, onDone?: () => void }} [opts]
 */
export function runStartCountdown(scene, opts = {}) {
    const { from = 3, depth = 9999, onDone } = opts

    scene.isCountingDown = true

    const physics = scene.physics?.world
    const wasPhysicsRunning = !!physics && !physics.isPaused
    if (wasPhysicsRunning) physics.pause()

    const keyboard = scene.input?.keyboard
    const wasKeyboardEnabled = !!keyboard && keyboard.enabled !== false
    if (keyboard) keyboard.enabled = false

    const wasTimePaused = !!scene.time?.paused
    if (scene.time) scene.time.paused = true

    const w = scene.scale.width
    const h = scene.scale.height

    const dim = scene.add
        .rectangle(w / 2, h / 2, w, h, 0x000000, 0.45)
        .setDepth(depth)
        .setScrollFactor(0)

    const num = scene.add
        .text(w / 2, h / 2, String(from), {
            fontSize: "180px",
            color: "#ffffff",
            stroke: "#0a0c10",
            strokeThickness: 10
        })
        .setOrigin(0.5)
        .setDepth(depth + 1)
        .setScrollFactor(0)

    const hint = scene.add
        .text(w / 2, h / 2 + 130, "Get ready…", {
            fontSize: "22px",
            color: "#dce4f0",
            stroke: "#0a0c10",
            strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(depth + 1)
        .setScrollFactor(0)

    let acc = 0
    let remaining = from
    let finished = false

    const cleanup = () => {
        scene.events.off("update", onUpdate)
        scene.events.off("shutdown", cleanup)
        scene.events.off("destroy", cleanup)
        if (dim?.scene) dim.destroy()
        if (num?.scene) num.destroy()
        if (hint?.scene) hint.destroy()
    }

    const finish = () => {
        if (finished) return
        finished = true
        if (wasPhysicsRunning && physics) physics.resume()
        if (keyboard) keyboard.enabled = wasKeyboardEnabled
        if (scene.time) scene.time.paused = wasTimePaused
        scene.isCountingDown = false
        onDone?.()
    }

    const popText = (text, color = "#ffffff") => {
        num.setText(text)
        num.setColor(color)
        num.setScale(1.4)
        scene.tweens.add({
            targets: num,
            scale: 1,
            duration: 220,
            ease: "back.out"
        })
    }

    popText(String(remaining))

    function onUpdate(_time, delta) {
        if (finished) return
        acc += delta
        if (acc < 1000) return
        acc -= 1000
        remaining -= 1
        if (remaining > 0) {
            popText(String(remaining))
            return
        }
        if (remaining === 0) {
            popText("GO!", "#86efac")
            hint.setText("")
            finish()
            window.setTimeout(() => {
                cleanup()
            }, 450)
        }
    }

    scene.events.on("update", onUpdate)
    scene.events.once("shutdown", cleanup)
    scene.events.once("destroy", cleanup)
}
