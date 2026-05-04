/**
 * First “air” frame on the chicken spritesheet (run is 0–2; 3–5 were the old flap cycle).
 * Using this alone reads as a simple platformer jump hold pose.
 */
export const PLAYER_JUMP_HOLD_FRAME = 3

/**
 * Stop wing-flap loops while airborne; keep one still frame for a normal jump look.
 * @param {Phaser.Physics.Arcade.Sprite} player
 */
export function setPlayerAirborneVisual(player) {
    if (!player?.active) return
    player.anims.stop()
    player.setFrame(PLAYER_JUMP_HOLD_FRAME)
}
