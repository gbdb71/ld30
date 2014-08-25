function defineSheets (version) {
  version = version || "";
  var spritesFile = 'sprites' + version + '.png';
  var tilesFile = 'tiles' + version + '.png';

  Q.compileSheets(spritesFile, 'sprites.json');
  Q.sheet('tiles', tilesFile, { tilew: 32, tileh: 32 });

  // A hack to invalidate TileLayer canvas cache
  if (Q.stage()) {
    Q.stage()._collisionLayers.forEach(function (layer) {
      layer.blocks = [];
    });
  }
}

// ## Asset Loading and Game Launch
var assetsList = [
  'sprites.png',
  'sprites2.png',
  'sprites.json',
  'tiles.png',
  'tiles2.png',
  'background-wall.png',
  'level0.json',
  'level1.json',
];

Q.load(assetsList, function () {
  defineSheets();

  Q.animations("player", {
    right: { frames: [0], flip: false },
    left:  { frames: [0], flip: "x" },
    rightdie: { frames: [1,2,3,4], rate: 1/8, flip: false, loop: false },
    leftdie:  { frames: [1,2,3,4], rate: 1/8, flip: 'x',   loop: false }
  });
  Q.animations("tower", {
    right: { frames: [0], flip: false },
    left:  { frames: [0], flip: "x" },
    rightrescue: { frames: [1,2,3,4], rate: 1/4, flip: false, loop: false },
    leftrescue:  { frames: [1,2,3,4], rate: 1/4, flip: 'x',   loop: false },
  });

  Q.stageScene("startGame");
});
