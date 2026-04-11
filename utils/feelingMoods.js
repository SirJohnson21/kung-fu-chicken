import { assetUrl } from "./assetUrl.js"

/** Preload keys must match `textureKey` (Phaser texture cache names). */
export const FEELING_MOODS = [
    { id: "low", label: "Low", blurb: "Low energy / down", textureKey: "feelingLow" },
    { id: "high", label: "High", blurb: "High energy / wired", textureKey: "feelingHigh" },
    { id: "happy", label: "Happy", blurb: "Feeling good", textureKey: "feelingHappy" },
    { id: "sad", label: "Sad", blurb: "Heavy or blue", textureKey: "feelingSad" }
]

const FEELING_IMAGE_FILES = [
    ["feelingLow", "assets/feeling-low.png"],
    ["feelingHigh", "assets/feeling-high.png"],
    ["feelingHappy", "assets/feeling-happy.png"],
    ["feelingSad", "assets/feeling-sad.png"]
]

export function preloadFeelingMoodImages(scene) {
    for (const [key, path] of FEELING_IMAGE_FILES) {
        if (!scene.textures.exists(key)) {
            scene.load.image(key, assetUrl(path))
        }
    }
}

/** Uniform scale so the image fits inside a square of `maxDim` px. */
export function getFeelingIconScale(icon, maxDim = 44) {
    return Math.min(maxDim / icon.width, maxDim / icon.height)
}
