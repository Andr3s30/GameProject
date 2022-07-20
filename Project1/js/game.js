import GameScene from "./scene1.js";

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene:[GameScene]
};

export const game = new Phaser.Game(config);
game.scene.start('GameScene');







