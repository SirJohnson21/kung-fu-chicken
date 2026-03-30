/**
 * Cleans the Level 5 enemy sprite: removes white background, softens artifact lines.
 * Writes transparent PNG to assets/level5.png (what Level5Scene loads).
 *
 * Source (first found): level5.png | enemy-level5-raw.png | enemy-level5-upload.png
 * Run: npm run process-level5-enemy
 */
const path = require("path")
const fs = require("fs")
const { Jimp } = require("jimp")

const assetsDir = path.join(__dirname, "..", "assets")
const level5Path = path.join(assetsDir, "level5.png")
const rawPath = path.join(assetsDir, "enemy-level5-raw.png")
const altRawPath = path.join(assetsDir, "enemy-level5-upload.png")
const outPath = level5Path

/** Euclidean distance from pure white in RGB. */
function distToWhite(data, i) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const dr = 255 - r
    const dg = 255 - g
    const db = 255 - b
    return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Mark pixels connected to image border through "background" (near-white) pixels.
 * Edge pixels are often anti-aliased gray (not pure white), so we seed the queue with a
 * looser threshold than we use when expanding — otherwise the flood never starts.
 */
function floodBackgroundMask(data, w, h, expandMaxDist, seedMaxDist) {
    const total = w * h
    const bg = new Uint8Array(total)
    const queue = []
    const idx2 = (x, y) => y * w + x
    const pidx = (x, y) => (y * w + x) * 4

    function tryPush(x, y, isSeed) {
        if (x < 0 || x >= w || y < 0 || y >= h) return
        const p = idx2(x, y)
        if (bg[p]) return
        const i = pidx(x, y)
        const d = distToWhite(data, i)
        const limit = isSeed ? seedMaxDist : expandMaxDist
        if (d > limit) return
        bg[p] = 1
        queue.push([x, y])
    }

    for (let x = 0; x < w; x++) {
        tryPush(x, 0, true)
        tryPush(x, h - 1, true)
    }
    for (let y = 0; y < h; y++) {
        tryPush(0, y, true)
        tryPush(w - 1, y, true)
    }

    while (queue.length) {
        const [x, y] = queue.pop()
        tryPush(x + 1, y, false)
        tryPush(x - 1, y, false)
        tryPush(x, y + 1, false)
        tryPush(x, y - 1, false)
    }
    return bg
}

/** Remove leftover near-white pixels (halos) without eating light gray metal. */
function killNearWhiteHalos(data, w, h) {
    for (let i = 0; i < w * h * 4; i += 4) {
        if (data[i + 3] < 16) continue
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r >= 248 && g >= 248 && b >= 248) {
            data[i + 3] = 0
        }
    }
}

function median3x3Rgb(data, w, h, x, y) {
    const rs = []
    const gs = []
    const bs = []
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const xx = Math.min(w - 1, Math.max(0, x + dx))
            const yy = Math.min(h - 1, Math.max(0, y + dy))
            const i = (yy * w + xx) * 4
            if (data[i + 3] < 8) continue
            rs.push(data[i])
            gs.push(data[i + 1])
            bs.push(data[i + 2])
        }
    }
    if (rs.length === 0) return null
    rs.sort((a, b) => a - b)
    gs.sort((a, b) => a - b)
    bs.sort((a, b) => a - b)
    const m = Math.floor(rs.length / 2)
    return [rs[m], gs[m], bs[m]]
}

function medianPass(data, w, h) {
    const copy = Buffer.from(data)
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            if (data[i + 3] < 16) continue
            const med = median3x3Rgb(data, w, h, x, y)
            if (!med) continue
            copy[i] = med[0]
            copy[i + 1] = med[1]
            copy[i + 2] = med[2]
        }
    }
    copy.copy(data)
}

function trimTransparent(img) {
    let minX = img.width
    let minY = img.height
    let maxX = 0
    let maxY = 0
    const data = img.bitmap.data
    const w = img.bitmap.width
    const h = img.bitmap.height
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            if (data[i + 3] > 16) {
                if (x < minX) minX = x
                if (y < minY) minY = y
                if (x > maxX) maxX = x
                if (y > maxY) maxY = y
            }
        }
    }
    if (minX > maxX) return img
    const pad = 2
    minX = Math.max(0, minX - pad)
    minY = Math.max(0, minY - pad)
    maxX = Math.min(w - 1, maxX + pad)
    maxY = Math.min(h - 1, maxY + pad)
    return img.crop({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 })
}

async function main() {
    const source = fs.existsSync(level5Path)
        ? level5Path
        : fs.existsSync(rawPath)
          ? rawPath
          : fs.existsSync(altRawPath)
            ? altRawPath
            : null
    if (!source) {
        console.error(
            "Missing source image. Add one of:\n",
            level5Path,
            "\n",
            rawPath,
            "\n",
            altRawPath
        )
        process.exit(1)
    }

    const img = await Jimp.read(source)
    const maxDim = 256
    if (img.width > maxDim || img.height > maxDim) {
        if (img.width >= img.height) {
            img.resize({ w: maxDim })
        } else {
            img.resize({ h: maxDim })
        }
    }

    const w = img.bitmap.width
    const h = img.bitmap.height
    const data = img.bitmap.data

    const bg = floodBackgroundMask(data, w, h, 52, 78)
    for (let p = 0; p < w * h; p++) {
        if (!bg[p]) continue
        const i = p * 4
        data[i + 3] = 0
    }

    killNearWhiteHalos(data, w, h)

    medianPass(data, w, h)
    medianPass(data, w, h)
    killNearWhiteHalos(data, w, h)

    let out = trimTransparent(img)
    if (out.bitmap.width < maxDim && out.bitmap.height < maxDim) {
        if (out.bitmap.width >= out.bitmap.height) {
            out.resize({ w: maxDim })
        } else {
            out.resize({ h: maxDim })
        }
    }
    await out.write(outPath)
    console.log("wrote", outPath, `${out.bitmap.width}x${out.bitmap.height}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
