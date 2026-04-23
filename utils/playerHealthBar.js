/**
 * Segmented lives bar above the player. Uses `scene.lives`; call `scene.refreshHealthBar()` after it changes.
 *
 * @param {Phaser.Scene} scene
 * @param {object} [opts]
 * @param {number} [opts.maxLives=3]
 * @param {number} [opts.yOffset=-76] added to player.y (typically negative)
 * @param {number} [opts.bgColor]
 * @param {number} [opts.borderColor]
 * @param {number} [opts.filledColor]
 * @param {number} [opts.emptyColor]
 * @param {string} [opts.labelColor]
 * @param {string} [opts.labelText]
 * @param {number} [opts.depth=1000]
 */
export function setupPlayerHealthBar(scene, opts = {}) {
    const maxLives = opts.maxLives ?? 3
    if (scene.lives === undefined) {
        scene.lives = maxLives
    }

    const h = 8
    const segW = 15
    const gap = 2
    const totalW = maxLives * segW + (maxLives - 1) * gap
    const bg = scene.add
        .rectangle(0, 5, totalW + 6, h + 3, opts.bgColor ?? 0x1a1530)
        .setStrokeStyle(1, opts.borderColor ?? 0x9b7dff)

    scene.healthSegments = []
    const startX = -totalW / 2 + segW / 2
    const filledC = opts.filledColor ?? 0x4ade80
    const emptyC = opts.emptyColor ?? 0x4a4558
    for (let i = 0; i < maxLives; i++) {
        const cx = startX + i * (segW + gap)
        const filled = i < scene.lives
        const seg = scene.add.rectangle(cx, 5, segW, h, filled ? filledC : emptyC)
        scene.healthSegments.push(seg)
    }

    scene.playerNameLabel = scene.add
        .text(0, -6, opts.labelText ?? "Cluck Norris", {
            fontSize: "10px",
            color: opts.labelColor ?? "#e8dcff"
        })
        .setOrigin(0.5, 1)

    const yOff = opts.yOffset ?? -76
    scene._playerHealthBarYOffset = yOff

    scene.healthBarContainer = scene.add.container(scene.player.x, scene.player.y + yOff, [
        scene.playerNameLabel,
        bg,
        ...scene.healthSegments
    ])
    scene.healthBarContainer.setDepth(opts.depth ?? 1000)

    scene.refreshHealthBar = () => {
        if (!scene.healthSegments) return
        const lives = scene.lives
        for (let i = 0; i < maxLives; i++) {
            scene.healthSegments[i].setFillStyle(i < lives ? filledC : emptyC)
        }
    }
}

export function syncPlayerHealthBarPosition(scene) {
    if (!scene.healthBarContainer || !scene.player?.active) return
    const yOff = scene._playerHealthBarYOffset ?? -76
    scene.healthBarContainer.setPosition(scene.player.x, scene.player.y + yOff)
}
