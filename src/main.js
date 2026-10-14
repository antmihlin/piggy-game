// Main entry point for Piggy Escape: Farmer Chase

// Accurately obtain viewport dimensions across desktop, mobile Safari, and Android Chrome
function getViewportDimensions() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (window.visualViewport) {
    w = window.visualViewport.width;
    h = window.visualViewport.height;
  }
  if (!w || !h) {
    w = document.documentElement.clientWidth || 960;
    h = document.documentElement.clientHeight || 540;
  }
  return { w: Math.round(w), h: Math.round(h) };
}

// Dynamically calculate game width to match the screen's exact aspect ratio
// (e.g. 19.5:9 on iPhone, 20:9 on Android, 16:9 on PC, 21:9 ultrawide) so there are ZERO black bars!
function calculateResponsiveGameSize() {
  const { w, h } = getViewportDimensions();
  const aspect = w / h;

  const baseH = 540;
  const baseW = Math.max(360, Math.round(baseH * aspect));

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
      autoCenter: Phaser.Scale.NO_CENTER,
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

  // Re-calculate immediately on window resize, visual viewport resize, and orientation change
  window.addEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 50);
    setTimeout(handleResize, 150);
    setTimeout(handleResize, 300);
    setTimeout(handleResize, 600);
  });
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', () => {
      setTimeout(handleResize, 50);
      setTimeout(handleResize, 200);
      setTimeout(handleResize, 500);
    });
  }
});
