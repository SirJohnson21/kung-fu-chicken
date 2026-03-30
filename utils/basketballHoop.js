/**
 * Side-view basketball goal art aligned with Level3Scene colliders
 * (backboard ~846, rim opening ~776–824, rim height ~322).
 */
export function addBasketballHoopVisual(scene) {
    const g = scene.add.graphics()

    const poleCx = 860
    const poleTop = 280
    const poleBottom = 500

    g.fillStyle(0x3d4249, 1)
    g.fillRect(poleCx - 13, poleTop, 26, poleBottom - poleTop)
    g.fillStyle(0x6d737d, 1)
    g.fillRect(poleCx - 13, poleTop, 9, poleBottom - poleTop)
    g.lineStyle(2, 0x25282c, 1)
    g.strokeRect(poleCx - 13, poleTop, 26, poleBottom - poleTop)

    g.fillStyle(0x2a2d32, 1)
    g.fillEllipse(poleCx, poleBottom + 2, 32, 12)

    const bbCx = 846
    const bbTop = 205
    const bbW = 26
    const bbH = 110

    g.lineStyle(10, 0x5a5f66, 1)
    g.lineBetween(poleCx - 6, 248, bbCx - 4, bbTop + bbH * 0.55)

    g.fillStyle(0xe8f0f8, 1)
    g.fillRect(bbCx - bbW / 2, bbTop, bbW, bbH)
    g.lineStyle(3, 0xc83800, 1)
    g.strokeRect(bbCx - bbW / 2, bbTop, bbW, bbH)
    g.lineStyle(1, 0xffffff, 0.9)
    g.strokeRect(bbCx - bbW / 2 + 2, bbTop + 2, bbW - 4, bbH - 4)

    g.fillStyle(0x1a1a1a, 1)
    g.fillRect(bbCx - 5, bbTop + 38, 10, 8)

    const rimX = 800
    const rimY = 322
    g.lineStyle(2, 0x8a8a8a, 1)
    g.lineBetween(bbCx - bbW / 2 + 1, bbTop + bbH - 2, rimX, rimY - 8)

    g.lineStyle(6, 0xd9480f, 1)
    g.strokeEllipse(rimX, rimY, 52, 14)
    g.lineStyle(2, 0xffb347, 1)
    g.strokeEllipse(rimX, rimY, 46, 10)

    g.fillStyle(0x1a0500, 0.35)
    g.fillEllipse(rimX, rimY + 1, 36, 6)

    const netTop = rimY + 6
    const netBottom = 356
    const netLeft = 776
    const netRight = 824
    g.lineStyle(1.2, 0xf5f5f5, 0.95)

    const strands = 9
    for (let i = 0; i <= strands; i++) {
        const t = i / strands
        const x = netLeft + t * (netRight - netLeft)
        const sway = (t - 0.5) * 5
        g.lineBetween(x, netTop, x + sway, netBottom)
    }

    for (let row = 1; row <= 4; row++) {
        const y = netTop + (row / 5) * (netBottom - netTop)
        const w = 10 + row * 3.5
        g.lineBetween(rimX - w, y, rimX + w, y)
    }

    for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8
        const x1 = netLeft + t * (netRight - netLeft)
        const x2 = netLeft + ((i + 1.5) / 8) * (netRight - netLeft)
        const yM = netTop + (netBottom - netTop) * 0.45
        g.lineBetween(x1, netTop + 4, x2, yM)
        g.lineBetween(x2, yM, x1, netBottom - 4)
    }

    g.setDepth(0)
    return g
}
