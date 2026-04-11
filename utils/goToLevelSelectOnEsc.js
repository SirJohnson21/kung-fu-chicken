import Phaser from "phaser"

/** Call once from a level scene's `create()` */
export function registerEscToLevelSelect(scene) {
    scene._keyEscLevelSelect = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
}

/**
 * Call at the very start of `update()`. If ESC was pressed, switches to Level Select and returns true.
 */
export function goToLevelSelectIfEsc(scene) {
    if (!scene._keyEscLevelSelect) return false
    if (Phaser.Input.Keyboard.JustDown(scene._keyEscLevelSelect)) {
        scene.scene.start("LevelSelectScene")
        return true
    }
    return false
}
