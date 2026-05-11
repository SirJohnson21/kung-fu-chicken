/**
 * Go to a gameplay scene with an in-scene start countdown.
 * The countdown is rendered on top of the level itself (not a separate scene).
 * Use for level transitions; do not use for `scene.restart()` after death.
 *
 * @param {Phaser.Scene} scene
 * @param {string} nextSceneKey
 */
export function startLevelWithCountdown(scene, nextSceneKey) {
    scene.scene.start(nextSceneKey, { withCountdown: true })
}
