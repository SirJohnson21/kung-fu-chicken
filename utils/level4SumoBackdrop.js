/**
 * Dohyō-style ring art for Level 4 (side-scrolling arena read).
 * @param {Phaser.Scene} scene
 * @param {{ depth?: number }} [opts]
 */
export function addLevel4SumoRingGraphics(scene, opts = {}) {
    const depth = opts.depth ?? -20
    const g = scene.add.graphics().setDepth(depth)

    g.fillStyle(0x1f1410, 1)
    g.fillRect(0, 0, 1000, 600)

    g.fillStyle(0x3d2818, 0.9)
    g.fillRect(0, 0, 1000, 140)

    g.fillStyle(0xf5edd6, 0.06)
    g.fillCircle(500, 360, 340)

    g.fillStyle(0xcdb896, 1)
    g.fillEllipse(500, 405, 920, 380)

    g.fillStyle(0xdccfb0, 0.45)
    g.fillEllipse(500, 392, 680, 260)

    g.fillStyle(0xbfa77e, 0.35)
    for (let r = 0; r < 14; r++) {
        const yy = 280 + r * 16
        g.lineStyle(1, 0xa8906e, 0.12)
        g.beginPath()
        g.moveTo(60, yy)
        g.lineTo(940, yy)
        g.strokePath()
    }

    g.lineStyle(9, 0xfafaf9, 0.96)
    g.strokeEllipse(500, 408, 880, 360)
    g.lineStyle(3, 0xe7e5e4, 0.88)
    g.strokeEllipse(500, 405, 740, 285)

    g.lineStyle(2, 0xffffff, 0.92)
    g.strokeEllipse(500, 368, 120, 58)

    const n = 20
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1)
        const x = 95 + t * 810
        const y = 498 + Math.sin(t * Math.PI) * 14
        g.fillStyle(0xede4d3, 1)
        g.fillEllipse(x, y, 48, 20)
        g.lineStyle(2, 0xc9b89a, 0.95)
        g.strokeEllipse(x, y, 48, 20)
        g.lineStyle(1, 0xa89878, 0.5)
        g.beginPath()
        g.moveTo(x - 14, y)
        g.lineTo(x + 14, y)
        g.strokePath()
    }

    g.fillStyle(0x4a3528, 1)
    g.fillRect(0, 360, 48, 200)
    g.fillRect(952, 360, 48, 200)
    g.lineStyle(3, 0x2d1f18, 0.85)
    g.strokeRect(0, 360, 48, 200)
    g.strokeRect(952, 360, 48, 200)

    g.fillStyle(0x292524, 0.55)
    g.fillRect(48, 120, 904, 48)

    return g
}

/**
 * @param {Phaser.Scene} scene
 * @param {string} message
 * @param {{ depth?: number, alpha?: number }} [opts]
 */
export function addLevel4SumoBannerText(scene, message, opts = {}) {
    return scene.add
        .text(500, 144, message, {
            fontSize: "13px",
            color: "#a8a29e",
            fontStyle: "italic"
        })
        .setOrigin(0.5)
        .setAlpha(opts.alpha ?? 0.52)
        .setDepth(opts.depth ?? -2)
}
