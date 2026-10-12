// Main entry point for Piggy Escape: Farmer Chase

// Dynamically calculate game width to perfectly match mobile landscape screen aspect ratio
// (e.g. 19.5:9 on iPhone, 20:9 on Android, 16:9 on PC) so there are ZERO black bars on the sides!
function calculateResponsiveGameSize() {
  const windowW = window.innerWidth || document.documentElement.clientWidth || 960;
  const windowH = window.innerHeight || document.documentElement.clientHeight || 540;
  const aspect = windowW / windowH;

  const baseH = 540;
  // If landscape or wide (aspect >= 1.6), expand base width so game matches screen aspect ratio edge-to-edge
  let baseW;
  if (aspect >= 1.6) {
    baseW = Math.max(960, Math.min(1366, Math.round(baseH * aspect)));
  } else if (aspect >= 1.0) {
    baseW = 960;
  } else {
    // If portrait on phone, give sufficient width so game is playable in portrait
    baseW = 960;
  }

  return { width: baseW, height: baseH };
}

window.addEventListener('load', () => {
  const initialSize = calculateResponsiveGameSize();

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'game-container',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: initialSize.width,
      height: initialSize.height
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

  const handleResize = () => {
    if (!window.game || !window.game.scale) return;
    const newSize = calculateResponsiveGameSize();
    window.game.scale.setGameSize(newSize.width, newSize.height);
    window.game.scale.refresh();
  };

  // Re-calculate on resize and mobile orientation change
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 300);
  });
});
