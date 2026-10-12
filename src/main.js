// Main entry point for Piggy Escape

window.addEventListener('load', () => {
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 540,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      activePointers: 3
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [BootScene, MenuScene, LevelPreviewScene, GameScene, UIScene]
  };

  window.game = new Phaser.Game(config);
});
