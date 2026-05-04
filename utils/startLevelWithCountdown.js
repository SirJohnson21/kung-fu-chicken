/**
 * Go to a gameplay scene after a 5-second on-screen countdown.
 * Use for level transitions; do not use for `scene.restart()` after death.
 *
 * @param {Phaser.Scene} scene
 * @param {string} nextSceneKey
 */
export function startLevelWithCountdown(scene, nextSceneKey) {
    scene.scene.start("LevelCountdownScene", { next: nextSceneKey })
}
