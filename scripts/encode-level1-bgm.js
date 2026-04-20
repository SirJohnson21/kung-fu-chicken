/**
 * Trims and compresses level1-bgm.wav → level1-bgm.m4a (AAC).
 * Run: node scripts/encode-level1-bgm.js
 */
const { execFileSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const ffmpeg = require("ffmpeg-static")

const root = path.join(__dirname, "..")
const wav = path.join(root, "assets", "level1-bgm.wav")
const m4a = path.join(root, "assets", "level1-bgm.m4a")

if (!fs.existsSync(wav)) {
    console.error("Missing:", wav)
    process.exit(1)
}

// Optional: set MAX_SECONDS (e.g. "90") to trim; omit trim for full source length
const MAX_SECONDS = null

const args = ["-y", "-i", wav, "-vn"]
if (MAX_SECONDS) {
    args.push("-t", MAX_SECONDS)
}
args.push(
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-movflags",
    "+faststart",
    m4a
)

execFileSync(ffmpeg, args, { stdio: "inherit" })

console.log("Wrote:", m4a)
