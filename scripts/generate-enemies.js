/**
 * Builds themed enemy PNGs for each level (run: node scripts/generate-enemies.js).
 */
const path = require("path")
const fs = require("fs")
const { Jimp, rgbaToInt } = require("jimp")

const assetsDir = path.join(__dirname, "..", "assets")

function c(r, g, b, a = 255) {
    return rgbaToInt(r, g, b, a)
}

function fillEllipse(img, cx, cy, rx, ry, color) {
    const x0 = Math.max(0, Math.floor(cx - rx))
    const x1 = Math.min(img.width - 1, Math.ceil(cx + rx))
    const y0 = Math.max(0, Math.floor(cy - ry))
    const y1 = Math.min(img.height - 1, Math.ceil(cy + ry))
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            const nx = (x - cx) / rx
            const ny = (y - cy) / ry
            if (nx * nx + ny * ny <= 1) {
                img.setPixelColor(color, x, y)
            }
        }
    }
}

function fillRect(img, x, y, w, h, color) {
    for (let j = y; j < y + h; j++) {
        for (let i = x; i < x + w; i++) {
            if (i >= 0 && j >= 0 && i < img.width && j < img.height) {
                img.setPixelColor(color, i, j)
            }
        }
    }
}

function strokeEllipse(img, cx, cy, rx, ry, color, thickness = 2) {
    for (let t = 0; t < thickness; t++) {
        const rxa = rx - t
        const ryb = ry - t
        if (rxa < 1 || ryb < 1) break
        for (let a = 0; a < 360; a += 2) {
            const rad = (a * Math.PI) / 180
            const x = Math.round(cx + Math.cos(rad) * rxa)
            const y = Math.round(cy + Math.sin(rad) * ryb)
            if (x >= 0 && y >= 0 && x < img.width && y < img.height) {
                img.setPixelColor(color, x, y)
            }
        }
    }
}

async function buildLevel1() {
    const img = new Jimp({ width: 256, height: 256, color: c(0, 0, 0, 0) })
    const body = c(210, 72, 48)
    const shade = c(160, 45, 32)
    const belly = c(255, 190, 140)
    const eye = c(255, 255, 250)
    const pupil = c(30, 20, 15)

    fillEllipse(img, 128, 138, 78, 88, body)
    fillEllipse(img, 128, 150, 62, 58, belly)
    fillEllipse(img, 95, 95, 22, 28, body)
    fillEllipse(img, 161, 95, 22, 28, body)
    strokeEllipse(img, 128, 138, 78, 88, shade, 3)

    fillEllipse(img, 102, 118, 14, 16, eye)
    fillEllipse(img, 154, 118, 14, 16, eye)
    fillEllipse(img, 104, 120, 6, 7, pupil)
    fillEllipse(img, 156, 120, 6, 7, pupil)

    fillEllipse(img, 128, 142, 10, 6, shade)
    return img
}

async function buildLevel2() {
    const img = new Jimp({ width: 256, height: 256, color: c(0, 0, 0, 0) })
    const suit = c(55, 62, 75)
    const suitEdge = c(35, 40, 52)
    const shirt = c(235, 238, 245)
    const tie = c(38, 72, 140)
    const tieDark = c(22, 48, 98)

    fillEllipse(img, 128, 135, 72, 82, suit)
    fillRect(img, 112, 100, 32, 36, shirt)
    fillRect(img, 120, 104, 16, 52, tie)
    fillRect(img, 122, 106, 12, 6, tieDark)
    strokeEllipse(img, 128, 135, 72, 82, suitEdge, 2)

    fillEllipse(img, 128, 88, 48, 52, c(240, 220, 200))
    strokeEllipse(img, 128, 88, 48, 52, suitEdge, 2)
    fillEllipse(img, 102, 82, 8, 9, c(240, 245, 255))
    fillEllipse(img, 154, 82, 8, 9, c(240, 245, 255))
    fillEllipse(img, 104, 84, 4, 5, c(40, 45, 55))
    fillEllipse(img, 156, 84, 4, 5, c(40, 45, 55))
    fillEllipse(img, 128, 98, 10, 6, c(180, 120, 110))

    return img
}

async function buildLevel4() {
    const img = new Jimp({ width: 256, height: 256, color: c(0, 0, 0, 0) })
    const blk = c(8, 12, 28)
    const hot = c(255, 51, 102)
    const neon = c(0, 255, 204)
    const glow = c(255, 0, 130)

    const px = 14
    const ox = 70
    const oy = 60
    const blocks = [
        [2, 0],
        [3, 0],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [5, 2],
        [2, 3],
        [3, 3],
        [2, 4],
        [3, 4]
    ]
    for (const [bx, by] of blocks) {
        const col = (bx + by) % 3 === 0 ? hot : (bx + by) % 3 === 1 ? neon : glow
        fillRect(img, ox + bx * px, oy + by * px, px - 1, px - 1, col)
        fillRect(img, ox + bx * px, oy + by * px, px - 1, 1, blk)
        fillRect(img, ox + bx * px, oy + by * px, 1, px - 1, blk)
    }
    fillRect(img, ox + 2 * px + 3, oy + 1 * px + 3, 6, 6, blk)
    fillRect(img, ox + 3 * px + 3, oy + 1 * px + 3, 6, 6, blk)

    strokeEllipse(img, 128, 128, 88, 96, c(0, 255, 200), 2)
    return img
}

async function main() {
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true })
    }

    const files = [
        ["enemy-level1.png", await buildLevel1()],
        ["enemy-level2.png", await buildLevel2()],
        ["enemy-level4.png", await buildLevel4()]
        // Level 5: hand art — run `node scripts/process-level5-enemy.js` (see enemy-level5-raw.png)
    ]

    for (const [name, image] of files) {
        const p = path.join(assetsDir, name)
        await image.write(p)
        console.log("wrote", p)
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
