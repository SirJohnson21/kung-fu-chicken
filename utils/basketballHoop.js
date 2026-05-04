/**
 * Side-view basketball goal art aligned with Level3Scene colliders
 * (backboard ~846, rim opening ~776–824, rim height ~322).
 */
export function addBasketballHoopVisual(scene) {
    const g = scene.add.graphics()

    const poleCx = 860
    const poleTop = 280
    const poleBottom = 500
    const bbCx = 846
    const bbTop = 205
    const bbW = 26
    const bbH = 110

    // Wall shadow behind goal (gym depth cue)
    g.fillStyle(0x0f1419, 0.35)
    g.fillEllipse(bbCx - 10, 312, 158, 208)

    g.fillStyle(0x0f1419, 0.25)
    g.fillRect(bbCx - bbW / 2 - 8, bbTop - 6, bbW + 16, bbH + 12)

    g.fillStyle(0x4a4f58, 1)
    g.fillRect(poleCx - 14, poleTop, 28, poleBottom - poleTop)
    g.fillStyle(0x8b939e, 1)
    g.fillRect(poleCx - 14, poleTop, 10, poleBottom - poleTop)
    g.lineStyle(2, 0x1a1d22, 1)
    g.strokeRect(poleCx - 14, poleTop, 28, poleBottom - poleTop)

    g.fillStyle(0x1e2228, 1)
    g.fillEllipse(poleCx, poleBottom + 2, 36, 14)

    g.lineStyle(11, 0x3d4350, 1)
    g.lineBetween(poleCx - 7, 248, bbCx - 4, bbTop + bbH * 0.55)

    // Glass backboard
    g.fillStyle(0xd8e8f5, 0.92)
    g.fillRect(bbCx - bbW / 2, bbTop, bbW, bbH)
    g.fillStyle(0xffffff, 0.2)
    g.fillRect(bbCx - bbW / 2 + 2, bbTop + 3, bbW - 8, bbH * 0.35)
    g.lineStyle(3, 0x7c2d12, 1)
    g.strokeRect(bbCx - bbW / 2, bbTop, bbW, bbH)
    g.lineStyle(1, 0xffffff, 0.75)
    g.strokeRect(bbCx - bbW / 2 + 2, bbTop + 2, bbW - 4, bbH - 4)

    g.fillStyle(0x111318, 1)
    g.fillRect(bbCx - 5, bbTop + 38, 10, 8)

    const rimX = 800
    const rimY = 322
    g.lineStyle(2, 0x6b7280, 1)
    g.lineBetween(bbCx - bbW / 2 + 1, bbTop + bbH - 2, rimX, rimY - 8)

    g.lineStyle(6, 0xc2410c, 1)
    g.strokeEllipse(rimX, rimY, 52, 14)
    g.lineStyle(2, 0xfbbf24, 0.95)
    g.strokeEllipse(rimX, rimY, 46, 10)

    g.fillStyle(0x1a0500, 0.4)
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

    g.setDepth(4)
    return g
}
