/**
 * Soft ambient bed for Level 6 (heaven flow). Run: node scripts/generate-level6-music.js
 */
const { execFileSync } = require("child_process")
const path = require("path")
const ffmpeg = require("ffmpeg-static")

const out = path.join(__dirname, "..", "assets", "level6-heaven.mp3")

execFileSync(
    ffmpeg,
    [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=329.63:sample_rate=44100:duration=48",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=415.3:sample_rate=44100:duration=48",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=523.25:sample_rate=44100:duration=48",
        "-filter_complex",
        "[0:a][1:a][2:a]amix=inputs=3:duration=first:weights=0.34 0.33 0.33,volume=0.14,afade=t=in:st=0:d=4,afade=t=out:st=44:d=4",
        "-c:a",
        "libmp3lame",
        "-q:a",
        "4",
        out
    ],
    { stdio: "pipe" }
)

console.log("Wrote:", out)
