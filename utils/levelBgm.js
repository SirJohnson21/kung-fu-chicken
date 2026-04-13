/** Looping level underscore. */
export const LEVEL_BGM_VOLUME = 0.28

export function playLevelBgm(scene, soundKey, volume = LEVEL_BGM_VOLUME) {
    if (scene.cache.audio.exists(soundKey)) {
        scene.sound.play(soundKey, { loop: true, volume })
    }
}

export function stopLevelBgm(scene, soundKey) {
    if (scene.cache.audio.exists(soundKey)) {
        scene.sound.stopByKey(soundKey)
    }
}

export function registerLevelBgmShutdown(scene, soundKey) {
    scene.events.once("shutdown", () => {
        stopLevelBgm(scene, soundKey)
    })
}
