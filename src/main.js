// Main entry point for Piggy Escape

window.addEventListener('load', () => {
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'game-container',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540
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

  // Auto-refresh scaling on window resize and mobile orientation change
  window.addEventListener('resize', () => {
    window.game?.scale?.refresh();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      window.game?.scale?.refresh();
    }, 200);
  });
});
