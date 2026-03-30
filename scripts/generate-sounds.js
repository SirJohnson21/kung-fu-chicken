/**
 * Regenerates assets/*.mp3 with short synthetic SFX (requires ffmpeg-static).
 * Run: node scripts/generate-sounds.js
 */
const { execFileSync } = require("child_process")
const path = require("path")
const ffmpeg = require("ffmpeg-static")

const assetsDir = path.join(__dirname, "..", "assets")

function ff(args) {
    execFileSync(ffmpeg, args, { stdio: "pipe" })
}

function out(name) {
    return path.join(assetsDir, name)
}

// Pleasant pickup: two rising notes (E5 → G5)
ff([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=659:sample_rate=44100:duration=0.07",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=784:sample_rate=44100:duration=0.08",
    "-filter_complex",
    "[0:a][1:a]concat=n=2:v=0:a=1,afade=t=out:st=0.12:d=0.03",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    out("egg-collect.mp3")
])

// Kick: low thump + quick decay
ff([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=120:sample_rate=44100:duration=0.1",
    "-af",
    "afade=t=in:st=0:d=0.008,afade=t=out:st=0.03:d=0.07,volume=1.2",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    out("kick.mp3")
])

// Hit / hurt: harsh beating tones (slightly dissonant)
ff([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "aevalsrc=0.4*(sin(2*PI*90*t)+sin(2*PI*97*t))*exp(-4*t):s=44100:d=0.28",
    "-af",
    "volume=0.9",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    out("hit.mp3")
])

// Quote / positivity ping: soft bell-like fifth
ff([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=523:sample_rate=44100:duration=0.12",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=784:sample_rate=44100:duration=0.14",
    "-filter_complex",
    "[0:a][1:a]amix=inputs=2:duration=longest:weights=0.55 0.45,afade=t=out:st=0.2:d=0.06",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "5",
    out("quote.mp3")
])

// Win: short ascending fanfare (C5 E5 G5 C6)
ff([
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=523:sample_rate=44100:duration=0.1",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=659:sample_rate=44100:duration=0.1",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=784:sample_rate=44100:duration=0.1",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=1047:sample_rate=44100:duration=0.18",
    "-filter_complex",
    "[0:a][1:a][2:a][3:a]concat=n=4:v=0:a=1,afade=t=out:st=0.42:d=0.06",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "4",
    out("win.mp3")
])

console.log("Wrote:", [
    "egg-collect.mp3",
    "kick.mp3",
    "hit.mp3",
    "quote.mp3",
    "win.mp3"
].join(", "))
