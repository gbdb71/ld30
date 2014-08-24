var DEV = true;

var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
        .setup({ maximize: true }) // Maximize this game to the size of the browser
        .controls().touch();       // And turn on default input controls and touch input

Q.input.keyboardControls({
  UP: 'up',       '87': 'up',    // W
  LEFT: 'left',   '65': 'left',  // A
  DOWN: 'down',   '83': 'down',  // S
  RIGHT: 'right', '68': 'right', // D
  SPACE: 'up'
});

Q.Sprite.extend("Player",{

  init: function (p) {

    this._super(p, {
      sheet: 'player',
      sprite: 'player',
      x: 200,
      y: 50,
      direction: 'right'
    });

    this.add('2d, platformerControls, animation');
  },

  step: function () {
    if (this.p.vx > 0) {
      this.p.direction = 'right';
    } else if (this.p.vx < 0) {
      this.p.direction = 'left';
    }
    this.play(this.p.direction);
  }

});


Q.Sprite.extend("Tower", {
  init: function (p) {
    this._super(p, {
      sheet: 'tower',
      sprite: 'tower',
      direction: 'left'
    });
    this.p.winActive = true;

    this.add('animation');

    this.on("hit.sprite", function (collision) {
      if (!this.p.winActive) { return; }
      if (collision.obj.isA("Player")) {
        //Q.stageScene("endGame",1, { label: "You Won!" });
        Q.stageScene("endLevel", 1);
        collision.obj.destroy();
      }
    });

    Q.state.on("change.lightdark", this, function(isDark) {
      this.p.winActive = !isDark;
    });
  },

  step: function () {
    this.play(this.p.direction);
  }
});

Q.Sprite.extend("Switch", {
  init: function (p) {
    this._super(p, {
      sheet: 'switch',
      sensor: true,
      _whenLastPressed: -1
    });

    this.on("sensor");
  },
  sensor: function (col) {
    if ( (this.p._whenLastPressed < Q._loopFrame - 1) ) {
      this.stage.dark = !this.stage.dark;
      Q.state.set("lightdark", this.stage.dark);
    }
    this.p._whenLastPressed = Q._loopFrame;
  }

});

Q.Sprite.extend("Enemy",{
  init: function (p) {
    this._super(p, { sheet: 'enemy', vx: 100 });
    this.p.hurtplayer = true;

    // Enemies use the Bounce AI to change direction whenever they run into something.
    this.add('2d, aiBounce');

    this.on("hit.sprite", function (collision) {
      if (!this.p.hurtplayer) { return; }
      if (collision.obj.isA("Player")) {
        //Q.stageScene("endGame",1, { label: "You Died" });
        Q.state.set("playerAlive", false);
        Q.stageScene("endLevel", 1);
        collision.obj.destroy();
      }
    });

    Q.state.on("change.lightdark", this, function(isDark) {
      this.p.hurtplayer = !isDark;
      if (isDark) {
        this.p.oldVx = this.p.vx;
        this.p.vx = 0;
      } else {
        this.p.vx = this.p.oldVx;
      }
    });

  }
});


Q.state.on('change.lightdark', function (isDark) {
  var version = isDark ? '2' : '';
  defineSheets(version);
});


Q.scene("level0", function (stage) {
  stage.insert(
    new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 })
  );
  stage.collisionLayer(
    window.tiles = new Q.TileLayer({ dataAsset: 'level0.json', sheet: 'tiles' })
  );

  stage.insert(new Q.Tower({ x: 592, y: 17 }));
  stage.insert(new Q.Switch({ x: 304, y: 48 }));
  stage.insert(new Q.Switch({ x: 592, y: -40 }));

  stage.insert(new Q.Enemy({ x: 400, y: 80 }));

  var player = stage.insert(new Q.Player({ x: 80, y: 80} ));
  stage.add("viewport").follow(player);
});

Q.scene("level1", function (stage) {
  stage.insert(
    new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 })
  );
  stage.collisionLayer(
    window.tiles = new Q.TileLayer({ dataAsset: 'level1.json', sheet: 'tiles' })
  );

  stage.insert(new Q.Tower({ x: 624, y: 177 }));
  stage.insert(new Q.Switch({ x: 496, y: 80 }));
  stage.insert(new Q.Switch({ x: 592, y: 112 }));

  stage.insert(new Q.Enemy({ x: 400, y: 112 }));

  var player = stage.insert(new Q.Player({ x: 144, y: 160 }));
  stage.add("viewport").follow(player);
});


// To display a game over / game won popup box,
// create a endGame scene that takes in a `label` option
// to control the displayed message.
Q.scene('endGame', function (stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(
    new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again" })
  );
  var label = container.insert(
    new Q.UI.Text({x:10, y: -10 - button.p.h, label: stage.options.label })
  );

  // When the button is clicked, clear all the stages and restart the game.
  button.on("click", function () {
    Q.clearStages();
    Q.stageScene('startGame');
  });

  // Expand the container to visibily fit it's contents (with a padding of 20 pixels)
  container.fit(20);
});

var NUM_LEVELS = 2;

Q.scene("endLevel", function(stage) {
  if (Q.state.get("playerAlive")) {
    Q.state.inc("currentLevel", 1);
  }
  var nextLevel = Q.state.get("currentLevel");
  if (nextLevel >= NUM_LEVELS) {
    return Q.stageScene("endGame", 1, { label: "The End" });
  }
  Q.state.set("playerAlive", true);
  Q.stageScene("level" + nextLevel);
});

Q.scene('startGame', function(stage) {
  Q.state.set("playerAlive", true);
  Q.state.set("currentLevel", 0);
  Q.stageScene("level0");
});
