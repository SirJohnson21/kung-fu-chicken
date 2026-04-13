/** 1000×600 game: 2×2 mood cards (indices 0–3 = top-left, top-right, bottom-left, bottom-right). */
export const MOOD_GRID = {
    cellW: 442,
    cellH: 222,
    gap: 14,
    /** Y of top edge of the grid (below header text) */
    top: 100
}

/**
 * World-space centers for each mood index (matches FEELING_MOODS order: low, high, happy, sad).
 * @param {number} [gridTopY] — Y where the grid starts (default MOOD_GRID.top).
 */
export function getMoodCellCenters(gridTopY) {
    const { cellW, cellH, gap, top: defaultTop } = MOOD_GRID
    const top = gridTopY ?? defaultTop
    const totalW = cellW * 2 + gap
    const left = (1000 - totalW) / 2
    const cx0 = left + cellW / 2
    const cx1 = left + cellW + gap + cellW / 2
    const cy0 = top + cellH / 2
    const cy1 = top + cellH + gap + cellH / 2
    return [
        { x: cx0, y: cy0 },
        { x: cx1, y: cy0 },
        { x: cx0, y: cy1 },
        { x: cx1, y: cy1 }
    ]
}

/**
 * @param {boolean} ju jd jl jr — JustDown for each arrow
 * @returns {number} possibly updated index
 */
export function nextMoodGridIndex(index, ju, jd, jl, jr) {
    if (ju && index >= 2) return index - 2
    if (jd && index < 2) return index + 2
    if (jl && index % 2 === 1) return index - 1
    if (jr && index % 2 === 0) return index + 1
    return index
}
