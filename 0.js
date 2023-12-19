PK   ���W               audio.js$.audio = {
  sounds: {},
  references: [],
  play: function(sound) {
    if (!$.mute) {
      var audio = $.audio.sounds[sound];
      if (audio.length > 1) {
        audio = $.audio.sounds[sound][Math.floor($.util.rand(0, audio.length))];
      } else {
        audio = $.audio.sounds[sound][0];
      }
      audio.pool[audio.tick].play();
      if (audio.tick < audio.count - 1) {
        audio.tick++;
      } else {
        audio.tick = 0;
      }
    }
  }
};

for (var k in $.definitions.audio) {
  $.audio.sounds[k] = [];

  $.definitions.audio[k].params.forEach(function(elem, index, array) {
    $.audio.sounds[k].push({
      tick: 0,
      count: $.definitions.audio[k].count,
      pool: []
    });

    for (var i = 0; i < $.definitions.audio[k].count; i++) {
      var audio = new Audio();
      audio.src = jsfxr(elem);
      $.audio.references.push(audio);
      $.audio.sounds[k][index].pool.push(audio);
    }

  });
}PK��J�  �  PK   ���W            	   bullet.js/*==============================================================================
Init
==============================================================================*/
$.Bullet = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  this.enemiesHit = [];
  this.inView = 0;
  $.particleEmitters.push(new $.ParticleEmitter({
    x: this.x,
    y: this.y,
    count: 1,
    spawnRange: 1,
    friction: 0.75,
    minSpeed: 2,
    maxSpeed: 10,
    minDirection: 0,
    maxDirection: $.twopi,
    hue: 0,
    saturation: 0
  }));
};

/*==============================================================================
Update
==============================================================================*/
$.Bullet.prototype.update = function(i) {
  /*==============================================================================
  Apply Forces
  ==============================================================================*/
  this.x += Math.cos(this.direction) * (this.speed * $.dt);
  this.y += Math.sin(this.direction) * (this.speed * $.dt);
  this.ex = this.x - Math.cos(this.direction) * this.size;
  this.ey = this.y - Math.sin(this.direction) * this.size;

  /*==============================================================================
  Check Collisions
  ==============================================================================*/
  var ei = $.enemies.length;
  while (ei--) {
    var enemy = $.enemies[ei];
    if ($.util.distance(this.x, this.y, enemy.x, enemy.y) <= enemy.radius) {
      if (this.enemiesHit.indexOf(enemy.index) == -1) {
        $.particleEmitters.push(new $.ParticleEmitter({
          x: this.x,
          y: this.y,
          count: Math.floor($.util.rand(1, 4)),
          spawnRange: 0,
          friction: 0.85,
          minSpeed: 5,
          maxSpeed: 12,
          minDirection: (this.direction - $.pi) - $.pi / 5,
          maxDirection: (this.direction - $.pi) + $.pi / 5,
          hue: enemy.hue
        }));

        this.enemiesHit.push(enemy.index);
        enemy.receiveDamage(ei, this.damage);

        if (this.enemiesHit.length > 3) {
          $.bullets.splice(i, 1);
        }
      }
      if (!this.piercing) {
        $.bullets.splice(i, 1);
      }
    }
  }

  /*==============================================================================
  Lock Bounds
  ==============================================================================*/
  if (!$.util.pointInRect(this.ex, this.ey, 0, 0, $.ww, $.wh)) {
    $.bullets.splice(i, 1);
  }

  /*==============================================================================
  Update View
  ==============================================================================*/
  if ($.util.pointInRect(this.ex, this.ey, -$.screen.x, -$.screen.y, $.cw, $.ch)) {
    this.inView = 1;
  } else {
    this.inView = 0;
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Bullet.prototype.render = function(i) {
  if (this.inView) {
    $.ctxmg.beginPath();
    $.ctxmg.moveTo(this.x, this.y);
    $.ctxmg.lineTo(this.ex, this.ey);
    $.ctxmg.lineWidth = this.lineWidth;
    $.ctxmg.strokeStyle = this.strokeStyle;
    $.ctxmg.stroke();
  }
};PK�E���  �  PK   ���W            	   button.js/*==============================================================================
Init
==============================================================================*/
$.Button = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  var text = $.text({
    ctx: $.ctxmg,
    x: 0,
    y: 0,
    text: this.title,
    hspacing: 1,
    vspacing: 0,
    halign: 'center',
    valign: 'center',
    scale: this.scale,
    snap: 1,
    render: 0
  });
  this.width = this.lockedWidth;
  this.height = this.lockedHeight;

  this.sx = this.x - this.width / 2;
  this.sy = this.y - this.height / 2;
  this.cx = this.x;
  this.cy = this.y;
  this.ex = this.x + this.width / 2;
  this.ey = this.y + this.height / 2;
  this.hovering = 0;
  this.ohovering = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.Button.prototype.update = function(i) {
  /*==============================================================================
  Check Hover State
  ==============================================================================*/
  if ($.util.pointInRect($.mouse.sx, $.mouse.sy, this.sx, this.sy, this.width, this.height)) {
    this.hovering = 1;
    if (!this.ohovering) {
      $.audio.play('hover');
    }
  } else {
    this.hovering = 0;
  }
  this.ohovering = this.hovering;

  /*==============================================================================
  Check Click
  ==============================================================================*/
  if (this.hovering && $.mouse.down) {
    $.audio.play('click');
    this.action();
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Button.prototype.render = function(i) {
  if (this.hovering) {
    $.ctxmg.fillStyle = 'hsla(0, 0%, 10%, 1)';
    $.ctxmg.fillRect(Math.floor(this.sx), Math.floor(this.sy), this.width, this.height);
    $.ctxmg.strokeStyle = 'hsla(0, 0%, 0%, 1)';
    $.ctxmg.strokeRect(Math.floor(this.sx) + 0.5, Math.floor(this.sy) + 0.5, this.width - 1, this.height - 1, 1);
    $.ctxmg.strokeStyle = 'hsla(0, 0%, 100%, 0.2)';
    $.ctxmg.strokeRect(Math.floor(this.sx) + 1.5, Math.floor(this.sy) + 1.5, this.width - 3, this.height - 3, 1);
  } else {
    $.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 1)';
    $.ctxmg.fillRect(Math.floor(this.sx), Math.floor(this.sy), this.width, this.height);
    $.ctxmg.strokeStyle = 'hsla(0, 0%, 0%, 1)';
    $.ctxmg.strokeRect(Math.floor(this.sx) + 0.5, Math.floor(this.sy) + 0.5, this.width - 1, this.height - 1, 1);
    $.ctxmg.strokeStyle = 'hsla(0, 0%, 100%, 0.15)';
    $.ctxmg.strokeRect(Math.floor(this.sx) + 1.5, Math.floor(this.sy) + 1.5, this.width - 3, this.height - 3, 1);
  }

  $.ctxmg.beginPath();
  $.text({
    ctx: $.ctxmg,
    x: this.cx,
    y: this.cy,
    text: this.title,
    hspacing: 1,
    vspacing: 0,
    halign: 'center',
    valign: 'center',
    scale: this.scale,
    snap: 1,
    render: true
  });

  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.7)';
  if (this.hovering) {
    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
  }
  $.ctxmg.fill();

  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.07)';
  $.ctxmg.fillRect(Math.floor(this.sx) + 2, Math.floor(this.sy) + 2, this.width - 4, Math.floor((this.height - 4) / 2));
};PK+��`  `  PK   ���W               definitions.js/*==============================================================================
Definitions
==============================================================================*/
$.definitions = {};

/*==============================================================================
Audio
==============================================================================*/
$.definitions.audio = {
  'shoot': {
    count: 10,
    params: [
			[2, , 0.2, , 0.1753, 0.64, , -0.5261, , , , , , 0.5522, -0.564, , , , 1, , , , , 0.25]
		]
  },
  'shootAlt': {
    count: 10,
    params: [
			[0, , 0.16, 0.18, 0.18, 0.47, 0.0084, -0.26, , , , , , 0.74, -1, , -0.76, , 1, , , , , 0.15]
		]
  },
  'hit': {
    count: 10,
    params: [
			[3, , 0.0138, , 0.2701, 0.4935, , -0.6881, , , , , , , , , , , 1, , , , , 0.25],
			[0, , 0.0639, , 0.2425, 0.7582, , -0.6217, , , , , , 0.4039, , , , , 1, , , , , 0.25],
			[3, , 0.0948, , 0.2116, 0.7188, , -0.6372, , , , , , , , , , , 1, , , 0.2236, , 0.25]
		]
  },
  'explosion': {
    count: 5,
    params: [
			[3, , 0.1164, 0.88, 0.37, 0.06, , 0.1599, , , , -0.0846, 0.6485, , , , 0.3963, -0.0946, 1, , , , , 0.25],
			[3, , 0.2958, 0.3173, 0.3093, 0.0665, , 0.1334, , , , , , , , , , , 1, , , , , 0.25]
		]
  },
  'explosionAlt': {
    count: 5,
    params: [
			[3, , 0.15, 0.7523, 0.398, 0.15, , -0.18, , 0.39, 0.53, -0.3428, 0.6918, , , 0.5792, 0.6, 0.56, 1, , , , , 0.25]
		]
  },
  'takingDamage': {
    count: 5,
    params: [
			[3, , 0.1606, 0.5988, 0.2957, 0.1157, , -0.3921, , , , , , , , , 0.3225, -0.2522, 1, , , , , 0.25],
			[3, , 0.1726, 0.2496, 0.2116, 0.0623, , -0.2096, , , , , , , , , 0.2665, -0.1459, 1, , , , , 0.25],
			[3, , 0.1645, 0.7236, 0.3402, 0.0317, , , , , , , , , , , , , 1, , , , , 0.25]
		]
  },
  'death': {
    count: 1,
    params: [
			[3, , 0.51, , 1, 0.1372, , 0.02, 0.1, , , , 0.89, 0.7751, , , -0.16, 0.32, 1, 0.3999, 0.81, , 0.1999, 0.15]
		]
  },
  'powerup': {
    count: 3,
    params: [
			[0, , 0.01, , 0.4384, 0.2, , 0.12, 0.28, 1, 0.65, , , 0.0419, , , , , 1, , , , , 0.4]
		]
  },
  'levelup': {
    count: 2,
    params: [
			[2, 1, 0.01, , 0.84, 0.19, , , , 0.62, 0.7, , , -0.7248, 0.8522, , , , 1, , , , , 0.45]
		]
  },
  'hover': {
    count: 10,
    params: [
			[0, 0.08, 0.18, , , 0.65, , 1, 1, , , 0.94, 1, , , , -0.3, 1, 1, , , 0.3, 0.5, 0.35]
		]
  },
  'click': {
    count: 5,
    params: [
			[3, , 0.18, , , 1, , -1, -1, , , , , , , , , , 1, , , 0.64, , 0.35]
		]
  }
};

/*==============================================================================
Enemies
==============================================================================*/
$.definitions.enemies = [
  { // Enemy 0 - horizontal / vertical	
    value: 5,
    speed: 1.5,
    life: 1,
    radius: 15,
    hue: 180,
    lockBounds: 1,
    setup: function() {
      if (this.start == 'top') {
        this.direction = $.pi / 2;
      } else if (this.start == 'right') {
        this.direction = -$.pi;
      } else if (this.start == 'bottom') {
        this.direction = -$.pi / 2;
      } else {
        this.direction = 0;
      }
    },
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      this.vx = Math.cos(this.direction) * speed;
      this.vy = Math.sin(this.direction) * speed;
    }
	},
  { // Enemy 1 - diagonal	
    value: 10,
    speed: 1.5,
    life: 2,
    radius: 15,
    hue: 120,
    lockBounds: 1,
    setup: function() {
      var rand = Math.floor($.util.rand(0, 2));
      if (this.start == 'top') {
        this.direction = (rand) ? $.pi / 2 + $.pi / 4 : $.pi / 2 - $.pi / 4;
      } else if (this.start == 'right') {
        this.direction = (rand) ? -$.pi + $.pi / 4 : -$.pi - $.pi / 4;
      } else if (this.start == 'bottom') {
        this.direction = (rand) ? -$.pi / 2 + $.pi / 4 : -$.pi / 2 - $.pi / 4;
      } else {
        this.direction = (rand) ? $.pi / 4 : -$.pi / 4;
      }
    },
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      this.vx = Math.cos(this.direction) * speed;
      this.vy = Math.sin(this.direction) * speed;
    }
	},
  { // Enemy 2 - move directly hero
    value: 15,
    speed: 1.5,
    life: 2,
    radius: 20,
    hue: 330,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
    }
	},
  { // Enemy 3 - splitter
    value: 20,
    speed: 0.5,
    life: 3,
    radius: 50,
    hue: 210,
    canSpawn: 1,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
    },
    death: function() {
      if (this.canSpawn) {
        for (var i = 0; i < 4; i++) {
          var enemy = $.spawnEnemy(this.type);
          enemy.radius = 20;
          enemy.canSpawn = 0;
          enemy.speed = 1;
          enemy.life = 1;
          enemy.value = 5;
          enemy.x = this.x;
          enemy.y = this.y;
          if (i == 0) {
            enemy.x -= 45;
          } else if (i == 1) {
            enemy.x += 45;
          } else if (i == 2) {
            enemy.y -= 45;
          } else {
            enemy.y += 45;
          }
          $.enemies.push(enemy);
        }
      }
    }
	},
  { // Enemy 4 - wanderer
    value: 25,
    speed: 2,
    life: 4,
    radius: 20,
    hue: 30,
    lockBounds: 1,
    setup: function() {
      if (this.start == 'top') {
        this.direction = $.pi / 2;
      } else if (this.start == 'right') {
        this.direction = -$.pi;
      } else if (this.start == 'bottom') {
        this.direction = -$.pi / 2;
      } else {
        this.direction = 0;
      }
    },
    behavior: function() {
      var speed = this.speed * $.util.rand(1, 2);
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      this.direction += $.util.rand(-0.15, 0.15);
      this.vx = Math.cos(this.direction) * speed;
      this.vy = Math.sin(this.direction) * speed;
    }
	},
  { // Enemy 5 - stealth, hard to see - move directly hero
    value: 30,
    speed: 1,
    life: 3,
    radius: 20,
    hue: 0,
    saturation: 0,
    lightness: 30,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
    }
	},
  { // Enemy 6 - big strong slow fatty
    value: 35,
    speed: 0.25,
    life: 8,
    radius: 80,
    hue: 150,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
    }
	},
  { // Enemy 7 - small weak speedy
    value: 40,
    speed: 2.5,
    life: 1,
    radius: 15,
    hue: 300,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      direction = direction + Math.cos($.tick / 50) * 1;
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
    }
	},
  { // Enemy 8 - strong grower, move to hero
    value: 45,
    speed: 1.5,
    growth: 0.1,
    life: 6,
    radius: 20,
    hue: 0,
    saturation: 0,
    lightness: 100,
    behavior: function() {
      var speed = this.speed,
        growth = this.growth;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
        growth = this.growth / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);

      if (Math.sqrt(dx * dx + dy * dy) > 200) {
        this.vx = Math.cos(direction) * speed;
        this.vy = Math.sin(direction) * speed;
        this.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 0.1)';
        this.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 1)';
      } else {
        this.vx += $.util.rand(-0.25, 0.25);
        this.vy += $.util.rand(-0.25, 0.25);
        this.radius += growth * $.dt;
        var hue = $.util.rand(0, 360);
        lightness = $.util.rand(50, 80);
        this.fillStyle = 'hsla(' + hue + ', 100%, ' + lightness + '%, 0.2)';
        this.strokeStyle = 'hsla(' + hue + ', 100%, ' + lightness + '%, 1)';
      }
    }
	},
  { // Enemy 9 - circle around hero
    value: 50,
    speed: 0.5,
    angleSpeed: 0.015,
    life: 2,
    radius: 20,
    hue: 60,
    setup: function() {
      var dx = this.x - $.hero.x,
        dy = this.y - $.hero.y;
      this.angle = Math.atan2(dy, dx);
      this.distance = Math.sqrt(dx * dx + dy * dy);
      if (Math.random() > 0.5) {
        this.angleSpeed = -this.angleSpeed;
      }
    },
    behavior: function() {
      var speed = this.speed,
        angleSpeed = this.angleSpeed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
        angleSpeed = this.angleSpeed / $.slowEnemyDivider;
      }

      this.distance -= speed * $.dt;
      this.angle += angleSpeed * $.dt;

      this.vx = (($.hero.x + Math.cos(this.angle) * this.distance) - this.x) / 50;
      this.vy = (($.hero.y + Math.sin(this.angle) * this.distance) - this.y) / 50;
    }
	},
  { // Enemy 10 - spawner
    value: 55,
    speed: 1,
    life: 3,
    radius: 45,
    hue: 0,
    canSpawn: 1,
    spawnTick: 0,
    spawnMax: 250,
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }

      var dx = $.hero.x - this.x,
        dy = $.hero.y - this.y,
        direction = Math.atan2(dy, dx);
      direction = direction + Math.cos($.tick / 50) * 1;
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;

      if (this.canSpawn) {
        if (this.spawnTick < this.spawnMax) {
          this.spawnTick += $.dt;
        } else {
          this.spawnTick = 0;
          var enemy = $.spawnEnemy(this.type);
          enemy.radius = 20;
          enemy.canSpawn = 0;
          enemy.speed = 3;
          enemy.life = 1;
          enemy.value = 30;
          enemy.x = this.x;
          enemy.y = this.y;
          $.enemies.push(enemy);
        }
      }
    }
	},
  { // Enemy 11 - random location strong tower
    value: 60,
    speed: 1.5,
    life: 10,
    radius: 30,
    hue: 90,
    setup: function() {
      this.xTarget = $.util.rand(50, $.ww - 50);
      this.yTarget = $.util.rand(50, $.wh - 50);
    },
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }
      var dx = this.xTarget - this.x,
        dy = this.yTarget - this.y,
        direction = Math.atan2(dy, dx);
      if (Math.sqrt(dx * dx + dy * dy) > this.speed) {
        this.vx = Math.cos(direction) * speed;
        this.vy = Math.sin(direction) * speed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }
	},
  { // Enemy 12 - speedy random direction, no homing
    value: 65,
    speed: 6,
    life: 1,
    radius: 5,
    hue: 0,
    lockBounds: 1,
    setup: function() {
      this.radius = $.util.rand(15, 35);
      this.speed = $.util.rand(3, 8);
      if (Math.random() > 0.5) {
        if (this.start == 'top') {
          this.direction = $.pi / 2;
        } else if (this.start == 'right') {
          this.direction = -$.pi;
        } else if (this.start == 'bottom') {
          this.direction = -$.pi / 2;
        } else {
          this.direction = 0;
        }
      } else {
        var rand = Math.floor($.util.rand(0, 2));
        if (this.start == 'top') {
          this.direction = (rand) ? $.pi / 2 + $.pi / 4 : $.pi / 2 - $.pi / 4;
        } else if (this.start == 'right') {
          this.direction = (rand) ? -$.pi + $.pi / 4 : -$.pi - $.pi / 4;
        } else if (this.start == 'bottom') {
          this.direction = (rand) ? -$.pi / 2 + $.pi / 4 : -$.pi / 2 - $.pi / 4;
        } else {
          this.direction = (rand) ? $.pi / 4 : -$.pi / 4;
        }
      }
    },
    behavior: function() {
      var speed = this.speed;
      if ($.slow) {
        speed = this.speed / $.slowEnemyDivider;
      }
      this.vx = Math.cos(this.direction) * speed;
      this.vy = Math.sin(this.direction) * speed;
      this.hue += 10;
      this.lightness = 50;
      this.fillStyle = 'hsla(' + this.hue + ', 100%, ' + this.lightness + '%, 0.2)';
      this.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.lightness + '%, 1)';
    }
	}
];

/*==============================================================================
Levels
==============================================================================*/
$.definitions.levels = [];
var base = 25;
for (var i = 0; i < $.definitions.enemies.length; i++) {
  var distribution = [];
  for (var di = 0; di < i + 1; di++) {
    var value = (di == i) ? Math.floor(((i + 1) * base) * 0.75) : (i + 1) * base;
    value = (i == 0) ? base : value;
    distribution.push(value);
  }
  $.definitions.levels.push({
    killsToLevel: 10 + (i + 1) * 7,
    distribution: distribution
  });
}

/*==============================================================================
Powerups
==============================================================================*/
$.definitions.powerups = [
  {
    title: 'HEALTH PACK',
    hue: 0,
    saturation: 0,
    lightness: 100
	},
  {
    title: 'SLOW ENEMIES',
    hue: 200,
    saturation: 0,
    lightness: 100
	},
  {
    title: 'FAST SHOT',
    hue: 100,
    saturation: 100,
    lightness: 60
	},
  {
    title: 'TRIPLE SHOT',
    hue: 200,
    saturation: 100,
    lightness: 60
	},
  {
    title: 'PIERCE SHOT',
    hue: 0,
    saturation: 100,
    lightness: 60
	}
];

/*==============================================================================
Letters
==============================================================================*/
$.definitions.letters = {
  '1': [
		 [, , 1, , 0],
		 [, 1, 1, , 0],
		 [, , 1, , 0],
		 [, , 1, , 0],
		 [1, 1, 1, 1, 1]
		 ],
  '2': [
		 [1, 1, 1, 1, 0],
		 [, , , , 1],
		 [, 1, 1, 1, 0],
		 [1, , , , 0],
		 [1, 1, 1, 1, 1]
		 ],
  '3': [
		 [1, 1, 1, 1, 0],
		 [, , , , 1],
		 [, 1, 1, 1, 1],
		 [, , , , 1],
		 [1, 1, 1, 1, 0]
		 ],
  '4': [
		 [1, , , 1, 0],
		 [1, , , 1, 0],
		 [1, 1, 1, 1, 1],
		 [, , , 1, 0],
		 [, , , 1, 0]
		 ],
  '5': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, 1, 1, 1, 0],
		 [, , , , 1],
		 [1, 1, 1, 1, 0]
		 ],
  '6': [
		 [, 1, 1, 1, 0],
		 [1, , , , 0],
		 [1, 1, 1, 1, 0],
		 [1, , , , 1],
		 [, 1, 1, 1, 0]
		 ],
  '7': [
		 [1, 1, 1, 1, 1],
		 [, , , , 1],
		 [, , , 1, 0],
		 [, , 1, , 0],
		 [, , 1, , 0]
		 ],
  '8': [
		 [, 1, 1, 1, 0],
		 [1, , , , 1],
		 [, 1, 1, 1, 0],
		 [1, , , , 1],
		 [, 1, 1, 1, 0]
		 ],
  '9': [
		 [, 1, 1, 1, 0],
		 [1, , , , 1],
		 [, 1, 1, 1, 1],
		 [, , , , 1],
		 [, 1, 1, 1, 0]
		 ],
  '0': [
		 [, 1, 1, 1, 0],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [, 1, 1, 1, 0]
		 ],
  'A': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, , , , 1]
		 ],
  'B': [
		 [1, 1, 1, 1, 0],
		 [1, , , 1, 0],
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'C': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, , , , 0],
		 [1, , , , 0],
		 [1, 1, 1, 1, 1]
		 ],
  'D': [
		 [1, 1, 1, , 0],
		 [1, , , 1, 0],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'E': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, 1, 1, , 0],
		 [1, , , , 0],
		 [1, 1, 1, 1, 1]
		 ],
  'F': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, 1, 1, , 0],
		 [1, , , , 0],
		 [1, , , , 0]
		 ],
  'G': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, , 1, 1, 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'H': [
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, , , , 1]
		 ],
  'I': [
		 [1, 1, 1, 1, 1],
		 [, , 1, , 0],
		 [, , 1, , 0],
		 [, , 1, , 0],
		 [1, 1, 1, 1, 1]
		 ],
  'J': [
		 [, , , , 1],
		 [, , , , 1],
		 [, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'K': [
		 [1, , , 1, 0],
		 [1, , 1, , 0],
		 [1, 1, 1, , 0],
		 [1, , , 1, 0],
		 [1, , , , 1]
		 ],
  'L': [
		 [1, , , , 0],
		 [1, , , , 0],
		 [1, , , , 0],
		 [1, , , , 0],
		 [1, 1, 1, 1, 1]
		 ],
  'M': [
		 [1, , , , 1],
		 [1, 1, , 1, 1],
		 [1, , 1, , 1],
		 [1, , , , 1],
		 [1, , , , 1]
		 ],
  'N': [
		 [1, , , , 1],
		 [1, 1, , , 1],
		 [1, , 1, , 1],
		 [1, , , 1, 1],
		 [1, , , , 1]
		 ],
  'O': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'P': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, , , , 0]
		 ],
  'Q': [
		 [1, 1, 1, 1, 0],
		 [1, , , 1, 0],
		 [1, , , 1, 0],
		 [1, , , 1, 0],
		 [1, 1, 1, 1, 1]
		 ],
  'R': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1],
		 [1, , , 1, 0],
		 [1, , , , 1]
		 ],
  'S': [
		 [1, 1, 1, 1, 1],
		 [1, , , , 0],
		 [1, 1, 1, 1, 1],
		 [, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'T': [
		 [1, 1, 1, 1, 1],
		 [, , 1, , 0],
		 [, , 1, , 0],
		 [, , 1, , 0],
		 [, , 1, , 0]
		 ],
  'U': [
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1]
		 ],
  'V': [
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , , , 1],
		 [, 1, , 1, 0],
		 [, , 1, , 0]
		 ],
  'W': [
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, , 1, , 1],
		 [1, 1, , 1, 1],
		 [1, , , , 1]
		 ],
  'X': [
		 [1, , , , 1],
		 [, 1, , 1, 0],
		 [, , 1, , 0],
		 [, 1, , 1, 0],
		 [1, , , , 1]
		 ],
  'Y': [
		 [1, , , , 1],
		 [1, , , , 1],
		 [1, 1, 1, 1, 1],
		 [, , 1, , 0],
		 [, , 1, , 0]
		 ],
  'Z': [
		 [1, 1, 1, 1, 1],
		 [, , , 1, 0],
		 [, , 1, , 0],
		 [, 1, , , 0],
		 [1, 1, 1, 1, 1]
		 ],
  ' ': [
		 [, , , , 0],
		 [, , , , 0],
		 [, , , , 0],
		 [, , , , 0],
		 [, , , , 0]
		 ],
  ',': [
		 [, , , , 0],
		 [, , , , 0],
		 [, , , , 0],
		 [, , 1, , 0],
		 [, , 1, , 0]
		 ],
  '+': [
		 [, , , , 0],
		 [, , 1, , 0],
		 [, 1, 1, 1, 0],
		 [, , 1, , 0],
		 [, , , , 0]
		 ],
  '/': [
		 [, , , , 1],
		 [, , , 1, 0],
		 [, , 1, , 0],
		 [, 1, , , 0],
		 [1, , , , 0]
		 ],
  ':': [
		 [, , , , 0],
		 [, , 1, , 0],
		 [, , , , 0],
		 [, , 1, , 0],
		 [, , , , 0]
		 ],
  '@': [
		 [1, 1, 1, 1, 1],
		 [, , , , 1],
		 [1, 1, 1, , 1],
		 [1, , 1, , 1],
		 [1, 1, 1, 1, 1]
		 ]
};PK?��>�J  �J  PK   ���W               enemy.js/*==============================================================================
Init
==============================================================================*/
$.Enemy = function(opt) {
  // set always and optional
  for (var k in opt) {
    this[k] = opt[k];
  }

  // set optional and defaults
  this.lightness = $.util.isset(this.lightness) ? this.lightness : 50;
  this.saturation = $.util.isset(this.saturation) ? this.saturation : 100;
  this.setup = this.setup || function() {};
  this.death = this.death || function() {};

  // set same for all objects
  this.index = $.indexGlobal++;
  this.inView = this.hitFlag = this.vx = this.vy = 0;
  this.lifeMax = opt.life;
  this.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 0.1)';
  this.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 1)';
  /*==============================================================================
  Run Setup
  ==============================================================================*/
  this.setup();

  /*==============================================================================
  Adjust Level Offset Difficulties
  ==============================================================================*/
  if ($.levelDiffOffset > 0) {
    this.life += $.levelDiffOffset * 0.25;
    this.lifeMax = this.life;
    this.speed += Math.min($.hero.vmax, $.levelDiffOffset * 0.25);
    this.value += $.levelDiffOffset * 5;
  }
};

/*==============================================================================
Update
==============================================================================*/
$.Enemy.prototype.update = function(i) {
  /*==============================================================================
  Apply Behavior
  ==============================================================================*/
  this.behavior();

  /*==============================================================================
  Apply Forces
  ==============================================================================*/
  this.x += this.vx * $.dt;
  this.y += this.vy * $.dt;

  /*==============================================================================
  Lock Bounds
  ==============================================================================*/
  if (this.lockBounds && !$.util.arcInRect(this.x, this.y, this.radius + 10, 0, 0, $.ww, $.wh)) {
    $.enemies.splice(i, 1);
  }

  /*==============================================================================
  Update View
  ==============================================================================*/
  if ($.util.arcInRect(this.x, this.y, this.radius, -$.screen.x, -$.screen.y, $.cw, $.ch)) {
    this.inView = 1;
  } else {
    this.inView = 0;
  }
};

/*==============================================================================
Receive Damage
==============================================================================*/
$.Enemy.prototype.receiveDamage = function(i, val) {
  if (this.inView) {
    $.audio.play('hit');
  }
  this.life -= val;
  this.hitFlag = 10;
  if (this.life <= 0) {
    if (this.inView) {
      $.explosions.push(new $.Explosion({
        x: this.x,
        y: this.y,
        radius: this.radius,
        hue: this.hue,
        saturation: this.saturation
      }));
      $.particleEmitters.push(new $.ParticleEmitter({
        x: this.x,
        y: this.y,
        count: 10,
        spawnRange: this.radius,
        friction: 0.85,
        minSpeed: 5,
        maxSpeed: 20,
        minDirection: 0,
        maxDirection: $.twopi,
        hue: this.hue,
        saturation: this.saturation
      }));
      $.textPops.push(new $.TextPop({
        x: this.x,
        y: this.y,
        value: this.value,
        hue: this.hue,
        saturation: this.saturation,
        lightness: 60
      }));
      $.rumble.level = 6;
    }
    this.death();
    $.spawnPowerup(this.x, this.y);
    $.score += this.value;
    $.level.kills++;
    $.kills++;
    $.enemies.splice(i, 1);
  }
};

/*==============================================================================
Render Health
==============================================================================*/
$.Enemy.prototype.renderHealth = function(i) {
  if (this.inView && this.life > 0 && this.life < this.lifeMax) {
    $.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 0.75)';
    $.ctxmg.fillRect(this.x - this.radius, this.y - this.radius - 6, this.radius * 2, 3);
    $.ctxmg.fillStyle = 'hsla(' + (this.life / this.lifeMax) * 120 + ', 100%, 50%, 0.75)';
    $.ctxmg.fillRect(this.x - this.radius, this.y - this.radius - 6, (this.radius * 2) * (this.life / this.lifeMax), 3);
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Enemy.prototype.render = function(i) {
  if (this.inView) {
    var mod = $.enemyOffsetMod / 6;
    $.util.fillCircle($.ctxmg, this.x, this.y, this.radius, this.fillStyle);
    $.util.strokeCircle($.ctxmg, this.x, this.y, this.radius / 4 + Math.cos(mod) * this.radius / 4, this.strokeStyle, 1.5);
    $.util.strokeCircle($.ctxmg, this.x, this.y, this.radius - 0.5, this.strokeStyle, 1);

    $.ctxmg.strokeStyle = this.strokeStyle;
    $.ctxmg.lineWidth = 4;
    $.ctxmg.beginPath();
    $.ctxmg.arc(this.x, this.y, this.radius - 0.5, mod + $.pi, mod + $.pi + $.pi / 2);
    $.ctxmg.stroke();
    $.ctxmg.beginPath();
    $.ctxmg.arc(this.x, this.y, this.radius - 0.5, mod, mod + $.pi / 2);
    $.ctxmg.stroke();

    if ($.slow) {
      $.util.fillCircle($.ctxmg, this.x, this.y, this.radius, 'hsla(' + $.util.rand(160, 220) + ', 100%, 50%, 0.25)');
    }
    if (this.hitFlag > 0) {
      this.hitFlag -= $.dt;
      $.util.fillCircle($.ctxmg, this.x, this.y, this.radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, 75%, ' + this.hitFlag / 10 + ')');
      $.util.strokeCircle($.ctxmg, this.x, this.y, this.radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand(60, 90) + '%, ' + this.hitFlag / 10 + ')', $.util.rand(1, 10));
    }
    this.renderHealth();
  }
};PK���    PK   ���W               explosion.js/*==============================================================================
Init
==============================================================================*/
$.Explosion = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  this.tick = 0;
  this.tickMax = 20;
  if ($.slow) {
    $.audio.play('explosionAlt');
  } else {
    $.audio.play('explosion');
  }
};

/*==============================================================================
Update
==============================================================================*/
$.Explosion.prototype.update = function(i) {
  if (this.tick >= this.tickMax) {
    $.explosions.splice(i, 1);
  } else {
    this.tick += $.dt;
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Explosion.prototype.render = function(i) {
  if ($.util.arcInRect(this.x, this.y, this.radius, -$.screen.x, -$.screen.y, $.cw, $.ch)) {
    var radius = 1 + (this.tick / (this.tickMax / 2)) * this.radius,
      lineWidth = $.util.rand(1, this.radius / 2);
    $.util.strokeCircle($.ctxmg, this.x, this.y, radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand(40, 80) + '%, ' + Math.min(1, Math.max(0, (1 - (this.tick / this.tickMax)))) + ')', lineWidth);
    $.ctxmg.beginPath();
    var size = $.util.rand(1, 1.5);
    for (var i = 0; i < 20; i++) {
      var angle = $.util.rand(0, $.twopi),
        x = this.x + Math.cos(angle) * radius,
        y = this.y + Math.sin(angle) * radius;

      $.ctxmg.rect(x - size / 2, y - size / 2, size, size);
    }
    $.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand(50, 100) + '%, 1)';
    $.ctxmg.fill();

    $.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, 50%, ' + Math.min(1, Math.max(0, (0.03 - (this.tick / this.tickMax) * 0.03))) + ')';
    $.ctxmg.fillRect(-$.screen.x, -$.screen.y, $.cw, $.ch);
  }
};PK~���  �  PK   ���W               game.js/*==============================================================================
Init
==============================================================================*/
$.init = function() {
  $.leftJoystick = document.getElementById('left-joystick');
  $.rightJoystick = document.getElementById('right-joystick');

  $.setupStorage();
  $.wrap = document.getElementById('wrap');
  $.wrapInner = document.getElementById('wrap-inner');
  $.cbg1 = document.getElementById('cbg1');
  $.cbg2 = document.getElementById('cbg2');
  $.cbg3 = document.getElementById('cbg3');
  $.cbg4 = document.getElementById('cbg4');
  $.cmg = document.getElementById('cmg');
  $.cfg = document.getElementById('cfg');
  $.ctxbg1 = $.cbg1.getContext('2d');
  $.ctxbg2 = $.cbg2.getContext('2d');
  $.ctxbg3 = $.cbg3.getContext('2d');
  $.ctxbg4 = $.cbg4.getContext('2d');
  $.ctxmg = $.cmg.getContext('2d');
  $.ctxfg = $.cfg.getContext('2d');
  $.cw = $.cmg.width = $.cfg.width = 800;
  $.ch = $.cmg.height = $.cfg.height = 600;
  $.wrap.style.width = $.wrapInner.style.width = $.cw + 'px';
  $.wrap.style.height = $.wrapInner.style.height = $.ch + 'px';
  $.wrap.style.marginLeft = (-$.cw / 2) - 10 + 'px';
  $.wrap.style.marginTop = (-$.ch / 2) - 10 + 'px';
  $.ww = Math.floor($.cw * 2);
  $.wh = Math.floor($.ch * 2);
  $.cbg1.width = Math.floor($.cw * 1.1);
  $.cbg1.height = Math.floor($.ch * 1.1);
  $.cbg2.width = Math.floor($.cw * 1.15);
  $.cbg2.height = Math.floor($.ch * 1.15);
  $.cbg3.width = Math.floor($.cw * 1.2);
  $.cbg3.height = Math.floor($.ch * 1.2);
  $.cbg4.width = Math.floor($.cw * 1.25);
  $.cbg4.height = Math.floor($.ch * 1.25);

  $.screen = {
    x: ($.ww - $.cw) / -2,
    y: ($.wh - $.ch) / -2
  };

  $.mute = $.storage['mute'];
  $.autofire = $.storage['autofire'];
  $.slowEnemyDivider = 3;

  $.keys = {
    state: {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      f: 0,
      m: 0,
      p: 0
    },
    pressed: {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      f: 0,
      m: 0,
      p: 0
    }
  };
  $.okeys = {};
  $.mouse = {
    x: $.ww / 2,
    y: $.wh / 2,
    sx: 0,
    sy: 0,
    ax: window.innerWidth / 2,
    ay: 0,
    down: 0
  };
  $.buttons = [];

  $.minimap = {
      x: 20,
      y: $.ch - Math.floor($.ch * 0.1) - 20,
      width: Math.floor($.cw * 0.1),
      height: Math.floor($.ch * 0.1),
      scale: Math.floor($.cw * 0.1) / $.ww,
      color: 'hsla(0, 0%, 0%, 0.85)',
      strokeColor: '#3a3a3a'
    },
    $.cOffset = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };

  $.levelCount = $.definitions.levels.length;
  $.states = {};
  $.state = '';
  $.enemies = [];
  $.bullets = [];
  $.explosions = [];
  $.powerups = [];
  $.particleEmitters = [];
  $.textPops = [];
  $.levelPops = [];
  $.powerupTimers = [];

  $.resizecb();
  $.bindEvents();
  $.setupStates();
  $.renderBackground1();
  $.renderBackground2();
  $.renderBackground3();
  $.renderBackground4();
  $.renderForeground();
  $.renderFavicon();
  $.setState('menu');
  $.loop();
};

/*==============================================================================
Reset
==============================================================================*/
$.reset = function() {
  $.indexGlobal = 0;
  $.dt = 1;
  $.lt = 0;
  $.elapsed = 0;
  $.tick = 0;

  $.gameoverTick = 0;
  $.gameoverTickMax = 200;
  $.gameoverExplosion = 0;

  $.instructionTick = 0;
  $.instructionTickMax = 400;

  $.levelDiffOffset = 0;
  $.enemyOffsetMod = 0;
  $.slow = 0;

  $.screen = {
    x: ($.ww - $.cw) / -2,
    y: ($.wh - $.ch) / -2
  };
  $.rumble = {
    x: 0,
    y: 0,
    level: 0,
    decay: 0.4
  };

  $.mouse.down = 0;

  $.level = {
    current: 0,
    kills: 0,
    killsToLevel: $.definitions.levels[0].killsToLevel,
    distribution: $.definitions.levels[0].distribution,
    distributionCount: $.definitions.levels[0].distribution.length
  };

  $.enemies.length = 0;
  $.bullets.length = 0;
  $.explosions.length = 0;
  $.powerups.length = 0;
  $.particleEmitters.length = 0;
  $.textPops.length = 0;
  $.levelPops.length = 0;
  $.powerupTimers.length = 0;

  for (var i = 0; i < $.definitions.powerups.length; i++) {
    $.powerupTimers.push(0);
  }

  $.kills = 0;
  $.bulletsFired = 0;
  $.powerupsCollected = 0;
  $.score = 0;

  $.hero = new $.Hero();

  $.levelPops.push(new $.LevelPop({
    level: 1
  }));
};

/*==============================================================================
Create Favicon
==============================================================================*/
$.renderFavicon = function() {
  var favicon = document.getElementById('favicon'),
    favc = document.createElement('canvas'),
    favctx = favc.getContext('2d'),
    faviconGrid = [
			[1, 1, 1, 1, 1, , , 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, , , , , , , , , , , , , , , 1],
			[1, , , , , , , , , , , , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, 1, 1, 1, , 0],
			[1, , , , , 1, 1, , , 1, 1, 1, 1, 1, , 0],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , 1, 1, , , 1, 1, , , , , 1],
			[, , 1, 1, 1, 1, 1, , , 1, 1, , , , , 1],
			[, , 1, 1, 1, 1, 1, , , 1, 1, , , , , 1],
			[1, , , , , , , , , , , , , , , 1],
			[1, , , , , , , , , , , , , , , 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, , , 1, 1, 1, 1, 1]
		];
  favc.width = favc.height = 16;
  favctx.beginPath();
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      if (faviconGrid[y][x] === 1) {
        favctx.rect(x, y, 1, 1);
      }
    }
  }
  favctx.fill();
  favicon.href = favc.toDataURL();
};

/*==============================================================================
Render Backgrounds
==============================================================================*/
$.renderBackground1 = function() {
  var gradient = $.ctxbg1.createRadialGradient($.cbg1.width / 2, $.cbg1.height / 2, 0, $.cbg1.width / 2, $.cbg1.height / 2, $.cbg1.height);
  gradient.addColorStop(0, 'hsla(0, 0%, 100%, 0.1)');
  gradient.addColorStop(0.65, 'hsla(0, 0%, 100%, 0)');
  $.ctxbg1.fillStyle = gradient;
  $.ctxbg1.fillRect(0, 0, $.cbg1.width, $.cbg1.height);

  var i = 2000;
  while (i--) {
    $.util.fillCircle($.ctxbg1, $.util.rand(0, $.cbg1.width), $.util.rand(0, $.cbg1.height), $.util.rand(0.2, 0.5), 'hsla(0, 0%, 100%, ' + $.util.rand(0.05, 0.2) + ')');
  }

  var i = 800;
  while (i--) {
    $.util.fillCircle($.ctxbg1, $.util.rand(0, $.cbg1.width), $.util.rand(0, $.cbg1.height), $.util.rand(0.1, 0.8), 'hsla(0, 0%, 100%, ' + $.util.rand(0.05, 0.5) + ')');
  }
}

$.renderBackground2 = function() {
  var i = 80;
  while (i--) {
    $.util.fillCircle($.ctxbg2, $.util.rand(0, $.cbg2.width), $.util.rand(0, $.cbg2.height), $.util.rand(1, 2), 'hsla(0, 0%, 100%, ' + $.util.rand(0.05, 0.15) + ')');
  }
}

$.renderBackground3 = function() {
  var i = 40;
  while (i--) {
    $.util.fillCircle($.ctxbg3, $.util.rand(0, $.cbg3.width), $.util.rand(0, $.cbg3.height), $.util.rand(1, 2.5), 'hsla(0, 0%, 100%, ' + $.util.rand(0.05, 0.1) + ')');
  }
}

$.renderBackground4 = function() {
  var size = 50;
  $.ctxbg4.fillStyle = 'hsla(0, 0%, 50%, 0.05)';
  var i = Math.round($.cbg4.height / size);
  while (i--) {
    $.ctxbg4.fillRect(0, i * size + 25, $.cbg4.width, 1);
  }
  i = Math.round($.cbg4.width / size);
  while (i--) {
    $.ctxbg4.fillRect(i * size, 0, 1, $.cbg4.height);
  }
}

/*==============================================================================
Render Foreground
==============================================================================*/
$.renderForeground = function() {
  var gradient = $.ctxfg.createRadialGradient($.cw / 2, $.ch / 2, $.ch / 3, $.cw / 2, $.ch / 2, $.ch);
  gradient.addColorStop(0, 'hsla(0, 0%, 0%, 0)');
  gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0.5)');
  $.ctxfg.fillStyle = gradient;
  $.ctxfg.fillRect(0, 0, $.cw, $.ch);

  $.ctxfg.fillStyle = 'hsla(0, 0%, 50%, 0.1)';
  var i = Math.round($.ch / 2);
  while (i--) {
    $.ctxfg.fillRect(0, i * 2, $.cw, 1);
  }

  var gradient2 = $.ctxfg.createLinearGradient($.cw, 0, 0, $.ch);
  gradient2.addColorStop(0, 'hsla(0, 0%, 100%, 0.04)');
  gradient2.addColorStop(0.75, 'hsla(0, 0%, 100%, 0)');
  $.ctxfg.beginPath();
  $.ctxfg.moveTo(0, 0);
  $.ctxfg.lineTo($.cw, 0);
  $.ctxfg.lineTo(0, $.ch);
  $.ctxfg.closePath();
  $.ctxfg.fillStyle = gradient2;
  $.ctxfg.fill();
}

/*==============================================================================
User Interface / UI / GUI / Minimap
==============================================================================*/

$.renderInterface = function() {
  /*==============================================================================
  Powerup Timers
  ==============================================================================*/
  for (var i = 0; i < $.definitions.powerups.length; i++) {
    var powerup = $.definitions.powerups[i],
      powerupOn = ($.powerupTimers[i] > 0);
    $.ctxmg.beginPath();
    var powerupText = $.text({
      ctx: $.ctxmg,
      x: $.minimap.x + $.minimap.width + 90,
      y: $.minimap.y + 4 + (i * 12),
      text: powerup.title,
      hspacing: 1,
      vspacing: 1,
      halign: 'right',
      valign: 'top',
      scale: 1,
      snap: 1,
      render: 1
    });
    if (powerupOn) {
      $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + (0.25 + (($.powerupTimers[i] / 300) * 0.75)) + ')';
    } else {
      $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.25)';
    }
    $.ctxmg.fill();
    if (powerupOn) {
      var powerupBar = {
        x: powerupText.ex + 5,
        y: powerupText.sy,
        width: 110,
        height: 5
      };
      $.ctxmg.fillStyle = 'hsl(' + powerup.hue + ', ' + powerup.saturation + '%, ' + powerup.lightness + '%)';
      $.ctxmg.fillRect(powerupBar.x, powerupBar.y, ($.powerupTimers[i] / 300) * powerupBar.width, powerupBar.height);
    }
  }

  /*==============================================================================
  Instructions
  ==============================================================================*/
  if ($.instructionTick < $.instructionTickMax) {
    $.instructionTick += $.dt;
    $.ctxmg.beginPath();
    $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 - 10,
      y: $.ch - 20,
      text: 'MOVE\nAIM/FIRE\nAUTOFIRE\nPAUSE\nMUTE',
      hspacing: 1,
      vspacing: 17,
      halign: 'right',
      valign: 'bottom',
      scale: 2,
      snap: 1,
      render: 1
    });
    if ($.instructionTick < $.instructionTickMax * 0.25) {
      var alpha = ($.instructionTick / ($.instructionTickMax * 0.25)) * 0.5;
    } else if ($.instructionTick > $.instructionTickMax - $.instructionTickMax * 0.25) {
      var alpha = (($.instructionTickMax - $.instructionTick) / ($.instructionTickMax * 0.25)) * 0.5;
    } else {
      var alpha = 0.5;
    }
    alpha = Math.min(1, Math.max(0, alpha));

    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 + 10,
      y: $.ch - 20,
      text: 'WASD/ARROWS\nMOUSE\nF\nP\nM',
      hspacing: 1,
      vspacing: 17,
      halign: 'left',
      valign: 'bottom',
      scale: 2,
      snap: 1,
      render: 1
    });
    if ($.instructionTick < $.instructionTickMax * 0.25) {
      var alpha = ($.instructionTick / ($.instructionTickMax * 0.25)) * 1;
    } else if ($.instructionTick > $.instructionTickMax - $.instructionTickMax * 0.25) {
      var alpha = (($.instructionTickMax - $.instructionTick) / ($.instructionTickMax * 0.25)) * 1;
    } else {
      var alpha = 1;
    }
    alpha = Math.min(1, Math.max(0, alpha));

    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
    $.ctxmg.fill();
  }

  /*==============================================================================
  Slow Enemies Screen Cover
  ==============================================================================*/
  if ($.powerupTimers[1] > 0) {
    $.ctxmg.fillStyle = 'hsla(200, 100%, 20%, 0.05)';
    $.ctxmg.fillRect(0, 0, $.cw, $.ch);
  }

  /*==============================================================================
  Health
  ==============================================================================*/
  $.ctxmg.beginPath();
  var healthText = $.text({
    ctx: $.ctxmg,
    x: 20,
    y: 20,
    text: 'HEALTH',
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
  $.ctxmg.fill();
  var healthBar = {
    x: healthText.ex + 10,
    y: healthText.sy,
    width: 110,
    height: 10
  };
  $.ctxmg.fillStyle = 'hsla(0, 0%, 20%, 1)';
  $.ctxmg.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.25)';
  $.ctxmg.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height / 2);
  $.ctxmg.fillStyle = 'hsla(' + $.hero.life * 120 + ', 100%, 40%, 1)';
  $.ctxmg.fillRect(healthBar.x, healthBar.y, $.hero.life * healthBar.width, healthBar.height);
  $.ctxmg.fillStyle = 'hsla(' + $.hero.life * 120 + ', 100%, 75%, 1)';
  $.ctxmg.fillRect(healthBar.x, healthBar.y, $.hero.life * healthBar.width, healthBar.height / 2);

  if ($.hero.takingDamage && $.hero.life > 0.01) {
    $.particleEmitters.push(new $.ParticleEmitter({
      x: -$.screen.x + healthBar.x + $.hero.life * healthBar.width,
      y: -$.screen.y + healthBar.y + healthBar.height / 2,
      count: 1,
      spawnRange: 2,
      friction: 0.85,
      minSpeed: 2,
      maxSpeed: 20,
      minDirection: $.pi / 2 - 0.2,
      maxDirection: $.pi / 2 + 0.2,
      hue: $.hero.life * 120,
      saturation: 100
    }));
  }

  /*==============================================================================
  Progress
  ==============================================================================*/
  $.ctxmg.beginPath();
  var progressText = $.text({
    ctx: $.ctxmg,
    x: healthBar.x + healthBar.width + 40,
    y: 20,
    text: 'PROGRESS',
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
  $.ctxmg.fill();
  var progressBar = {
    x: progressText.ex + 10,
    y: progressText.sy,
    width: healthBar.width,
    height: healthBar.height
  };
  $.ctxmg.fillStyle = 'hsla(0, 0%, 20%, 1)';
  $.ctxmg.fillRect(progressBar.x, progressBar.y, progressBar.width, progressBar.height);
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.25)';
  $.ctxmg.fillRect(progressBar.x, progressBar.y, progressBar.width, progressBar.height / 2);
  $.ctxmg.fillStyle = 'hsla(0, 0%, 50%, 1)';
  $.ctxmg.fillRect(progressBar.x, progressBar.y, ($.level.kills / $.level.killsToLevel) * progressBar.width, progressBar.height);
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
  $.ctxmg.fillRect(progressBar.x, progressBar.y, ($.level.kills / $.level.killsToLevel) * progressBar.width, progressBar.height / 2);

  if ($.level.kills == $.level.killsToLevel) {
    $.particleEmitters.push(new $.ParticleEmitter({
      x: -$.screen.x + progressBar.x + progressBar.width,
      y: -$.screen.y + progressBar.y + progressBar.height / 2,
      count: 30,
      spawnRange: 5,
      friction: 0.95,
      minSpeed: 2,
      maxSpeed: 25,
      minDirection: 0,
      minDirection: $.pi / 2 - $.pi / 4,
      maxDirection: $.pi / 2 + $.pi / 4,
      hue: 0,
      saturation: 0
    }));
  }

  /*==============================================================================
  Score
  ==============================================================================*/
  $.ctxmg.beginPath();
  var scoreLabel = $.text({
    ctx: $.ctxmg,
    x: progressBar.x + progressBar.width + 40,
    y: 20,
    text: 'SCORE',
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
  $.ctxmg.fill();

  $.ctxmg.beginPath();
  var scoreText = $.text({
    ctx: $.ctxmg,
    x: scoreLabel.ex + 10,
    y: 20,
    text: $.util.pad($.score, 6),
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
  $.ctxmg.fill();

  $.ctxmg.beginPath();
  var bestLabel = $.text({
    ctx: $.ctxmg,
    x: scoreText.ex + 40,
    y: 20,
    text: 'BEST',
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
  $.ctxmg.fill();

  $.ctxmg.beginPath();
  var bestText = $.text({
    ctx: $.ctxmg,
    x: bestLabel.ex + 10,
    y: 20,
    text: $.util.pad(Math.max($.storage['score'], $.score), 6),
    hspacing: 1,
    vspacing: 1,
    halign: 'top',
    valign: 'left',
    scale: 2,
    snap: 1,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
  $.ctxmg.fill();
};

$.renderMinimap = function() {
  $.ctxmg.fillStyle = $.minimap.color;
  $.ctxmg.fillRect($.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height);

  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.1)';
  $.ctxmg.fillRect(
    Math.floor($.minimap.x + -$.screen.x * $.minimap.scale),
    Math.floor($.minimap.y + -$.screen.y * $.minimap.scale),
    Math.floor($.cw * $.minimap.scale),
    Math.floor($.ch * $.minimap.scale)
  );

  //$.ctxmg.beginPath();
  for (var i = 0; i < $.enemies.length; i++) {
    var enemy = $.enemies[i],
      x = $.minimap.x + Math.floor(enemy.x * $.minimap.scale),
      y = $.minimap.y + Math.floor(enemy.y * $.minimap.scale);
    if ($.util.pointInRect(x + 1, y + 1, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height)) {
      //$.ctxmg.rect( x, y, 2, 2 );
      $.ctxmg.fillStyle = 'hsl(' + enemy.hue + ', ' + enemy.saturation + '%, 50%)';
      $.ctxmg.fillRect(x, y, 2, 2);
    }
  }
  //$.ctxmg.fillStyle = '#f00';
  //$.ctxmg.fill();

  $.ctxmg.beginPath();
  for (var i = 0; i < $.bullets.length; i++) {
    var bullet = $.bullets[i],
      x = $.minimap.x + Math.floor(bullet.x * $.minimap.scale),
      y = $.minimap.y + Math.floor(bullet.y * $.minimap.scale);
    if ($.util.pointInRect(x, y, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height)) {
      $.ctxmg.rect(x, y, 1, 1);
    }
  }
  $.ctxmg.fillStyle = '#fff';
  $.ctxmg.fill();

  $.ctxmg.fillStyle = $.hero.fillStyle;
  $.ctxmg.fillRect($.minimap.x + Math.floor($.hero.x * $.minimap.scale), $.minimap.y + Math.floor($.hero.y * $.minimap.scale), 2, 2);

  $.ctxmg.strokeStyle = $.minimap.strokeColor;
  $.ctxmg.strokeRect($.minimap.x - 0.5, $.minimap.y - 0.5, $.minimap.width + 1, $.minimap.height + 1);
};

/*==============================================================================
Enemy Spawning
==============================================================================*/
$.getSpawnCoordinates = function(radius) {
  var quadrant = Math.floor($.util.rand(0, 4)),
    x,
    y,
    start;

  if (quadrant === 0) {
    x = $.util.rand(0, $.ww);
    y = -radius;
    start = 'top';
  } else if (quadrant === 1) {
    x = $.ww + radius;
    y = $.util.rand(0, $.wh);
    start = 'right';
  } else if (quadrant === 2) {
    x = $.util.rand(0, $.ww);
    y = $.wh + radius;
    start = 'bottom';
  } else {
    x = -radius;
    y = $.util.rand(0, $.wh);
    start = 'left';
  }

  return { x: x, y: y, start: start };
};

$.spawnEnemy = function(type) {
  var params = $.definitions.enemies[type],
    coordinates = $.getSpawnCoordinates(params.radius);
  params.x = coordinates.x;
  params.y = coordinates.y;
  params.start = coordinates.start;
  params.type = type;
  return new $.Enemy(params);
};

$.spawnEnemies = function() {
  var floorTick = Math.floor($.tick);
  for (var i = 0; i < $.level.distributionCount; i++) {
    var timeCheck = $.level.distribution[i];
    if ($.levelDiffOffset > 0) {
      timeCheck = Math.max(1, timeCheck - ($.levelDiffOffset * 2));
    }
    if (floorTick % timeCheck === 0) {
      $.enemies.push($.spawnEnemy(i));
    }
  }
};

/*==============================================================================
Events
==============================================================================*/
$.mousemovecb = function(e) {
  if (!$.mouse.left_joystick && !$.mouse.right_joystick) {
    e.preventDefault();
    $.mouse.ax = e.pageX;
    $.mouse.ay = e.pageY;
    $.mousescreen();
  }
};

$.mousescreen = function() {
  $.mouse.sx = $.mouse.ax - $.cOffset.left;
  $.mouse.sy = $.mouse.ay - $.cOffset.top;
  $.mouse.x = $.mouse.sx - $.screen.x;
  $.mouse.y = $.mouse.sy - $.screen.y;
};

$.mousedowncb = function(e) {
  if (!$.mouse.left_joystick && !$.mouse.right_joystick) {
    e.preventDefault();
    $.mouse.down = 1;
  }
};

$.mouseupcb = function(e) {
  if (!$.mouse.left_joystick && !$.mouse.right_joystick) {
    e.preventDefault();
    $.mouse.down = 0;
  }
};

$.keydowncb = function(e) {
  var e = (e.keyCode ? e.keyCode : e.which);
  if (e === 38 || e === 87) { $.keys.state.up = 1; }
  if (e === 39 || e === 68) { $.keys.state.right = 1; }
  if (e === 40 || e === 83) { $.keys.state.down = 1; }
  if (e === 37 || e === 65) { $.keys.state.left = 1; }
  if (e === 70) { $.keys.state.f = 1; }
  if (e === 77) { $.keys.state.m = 1; }
  if (e === 80) { $.keys.state.p = 1; }
}

$.keyupcb = function(e) {
  var e = (e.keyCode ? e.keyCode : e.which);
  if (e === 38 || e === 87) { $.keys.state.up = 0; }
  if (e === 39 || e === 68) { $.keys.state.right = 0; }
  if (e === 40 || e === 83) { $.keys.state.down = 0; }
  if (e === 37 || e === 65) { $.keys.state.left = 0; }
  if (e === 70) { $.keys.state.f = 0; }
  if (e === 77) { $.keys.state.m = 0; }
  if (e === 80) { $.keys.state.p = 0; }
}

$.resizecb = function(e) {
  var rect = $.cmg.getBoundingClientRect();
  $.cOffset = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  }
}

$.blurcb = function() {
  if ($.state == 'play') {
    $.setState('pause');
  }
}

$.bindEvents = function() {
  TouchCompat.init();
  TouchCompat.joystick({
    zone: $.leftJoystick,
    position: { top: '50%', left: '50%' },
    mode: 'static'
  }).on('move', function(e, data) {
    var angle = data.angle.degree;
    $.keys.state.down = 200 <= angle && angle < 340;
    $.keys.state.up = 20 <= angle && angle < 160;
    $.keys.state.left = 110 <= angle && angle < 250;
    $.keys.state.right = (0 <= angle && angle < 70) || (290 <= angle && angle <= 360);
  }).on('start', function() {
    $.mouse.left_joystick = 1;
  }).on('end', function() {
    $.mouse.left_joystick = 0;
    $.keys.state.down = 0;
    $.keys.state.up = 0;
    $.keys.state.left = 0;
    $.keys.state.right = 0;
  })
  TouchCompat.joystick({
    zone: $.rightJoystick,
    position: { top: '50%', left: '50%' },
    mode: 'static'
  }).on('move', function(e, data) {
    var radius = 300;
    var center = {
      x: $.cOffset.left + $.cOffset.width / 2,
      y: $.cOffset.top + $.cOffset.height / 2
    };
    var angle = data.angle.radian;
    $.mouse.ax = center.x + radius * Math.cos(angle);
    $.mouse.ay = center.y - radius * Math.sin(angle);
    $.mousescreen();
    $.mouse.down = 1;
  }).on('start', function() {
    $.mouse.down = 0;
    $.mouse.right_joystick = 1;
  }).on('end', function() {
    $.mouse.down = 0;
    $.mouse.right_joystick = 0;
  });

  window.addEventListener('mousemove', $.mousemovecb);
  window.addEventListener('mousedown', $.mousedowncb);
  window.addEventListener('mouseup', $.mouseupcb);
  window.addEventListener('keydown', $.keydowncb);
  window.addEventListener('keyup', $.keyupcb);
  window.addEventListener('resize', $.resizecb);
  window.addEventListener('blur', $.blurcb);
};

/*==============================================================================
Miscellaneous
==============================================================================*/
$.clearScreen = function() {
  $.ctxmg.clearRect(0, 0, $.cw, $.ch);
};

$.updateDelta = function() {
  var now = Date.now();
  $.dt = (now - $.lt) / (1000 / 60);
  $.dt = ($.dt < 0) ? 0.001 : $.dt;
  $.dt = ($.dt > 10) ? 10 : $.dt;
  $.lt = now;
  $.elapsed += $.dt;
};

$.updateScreen = function() {
  var xSnap,
    xModify,
    ySnap,
    yModify;

  if ($.hero.x < $.cw / 2) {
    xModify = $.hero.x / $.cw;
  } else if ($.hero.x > $.ww - $.cw / 2) {
    xModify = 1 - ($.ww - $.hero.x) / $.cw;
  } else {
    xModify = 0.5;
  }

  if ($.hero.y < $.ch / 2) {
    yModify = $.hero.y / $.ch;
  } else if ($.hero.y > $.wh - $.ch / 2) {
    yModify = 1 - ($.wh - $.hero.y) / $.ch;
  } else {
    yModify = 0.5;
  }

  xSnap = (($.cw * xModify - $.hero.x) - $.screen.x) / 30;
  ySnap = (($.ch * yModify - $.hero.y) - $.screen.y) / 30;

  // ease to new coordinates
  $.screen.x += xSnap * $.dt;
  $.screen.y += ySnap * $.dt;

  // update rumble levels, keep X and Y changes consistent, apply rumble
  if ($.rumble.level > 0) {
    $.rumble.level -= $.rumble.decay;
    $.rumble.level = ($.rumble.level < 0) ? 0 : $.rumble.level;
    $.rumble.x = $.util.rand(-$.rumble.level, $.rumble.level);
    $.rumble.y = $.util.rand(-$.rumble.level, $.rumble.level);
  } else {
    $.rumble.x = 0;
    $.rumble.y = 0;
  }

  //$.screen.x -= $.rumble.x;
  //$.screen.y -= $.rumble.y;

  // animate background canvas
  $.cbg1.style.marginLeft = -(($.cbg1.width - $.cw) / 2) // half the difference from bg to viewport
    -
    (($.cbg1.width - $.cw) / 2) // half the diff again, modified by a percentage below
    *
    ((-$.screen.x - ($.ww - $.cw) / 2) / (($.ww - $.cw) / 2)) // viewport offset applied to bg
    -
    $.rumble.x + 'px';
  $.cbg1.style.marginTop = -(($.cbg1.height - $.ch) / 2) -
    (($.cbg1.height - $.ch) / 2) *
    ((-$.screen.y - ($.wh - $.ch) / 2) / (($.wh - $.ch) / 2)) -
    $.rumble.y + 'px';
  $.cbg2.style.marginLeft = -(($.cbg2.width - $.cw) / 2) // half the difference from bg to viewport
    -
    (($.cbg2.width - $.cw) / 2) // half the diff again, modified by a percentage below
    *
    ((-$.screen.x - ($.ww - $.cw) / 2) / (($.ww - $.cw) / 2)) // viewport offset applied to bg
    -
    $.rumble.x + 'px';
  $.cbg2.style.marginTop = -(($.cbg2.height - $.ch) / 2) -
    (($.cbg2.height - $.ch) / 2) *
    ((-$.screen.y - ($.wh - $.ch) / 2) / (($.wh - $.ch) / 2)) -
    $.rumble.y + 'px';
  $.cbg3.style.marginLeft = -(($.cbg3.width - $.cw) / 2) // half the difference from bg to viewport
    -
    (($.cbg3.width - $.cw) / 2) // half the diff again, modified by a percentage below
    *
    ((-$.screen.x - ($.ww - $.cw) / 2) / (($.ww - $.cw) / 2)) // viewport offset applied to bg
    -
    $.rumble.x + 'px';
  $.cbg3.style.marginTop = -(($.cbg3.height - $.ch) / 2) -
    (($.cbg3.height - $.ch) / 2) *
    ((-$.screen.y - ($.wh - $.ch) / 2) / (($.wh - $.ch) / 2)) -
    $.rumble.y + 'px';
  $.cbg4.style.marginLeft = -(($.cbg4.width - $.cw) / 2) // half the difference from bg to viewport
    -
    (($.cbg4.width - $.cw) / 2) // half the diff again, modified by a percentage below
    *
    ((-$.screen.x - ($.ww - $.cw) / 2) / (($.ww - $.cw) / 2)) // viewport offset applied to bg
    -
    $.rumble.x + 'px';
  $.cbg4.style.marginTop = -(($.cbg4.height - $.ch) / 2) -
    (($.cbg4.height - $.ch) / 2) *
    ((-$.screen.y - ($.wh - $.ch) / 2) / (($.wh - $.ch) / 2)) -
    $.rumble.y + 'px';

  $.mousescreen();
};

$.updateLevel = function() {
  if ($.level.kills >= $.level.killsToLevel) {
    if ($.level.current + 1 < $.levelCount) {
      $.level.current++;
      $.level.kills = 0;
      $.level.killsToLevel = $.definitions.levels[$.level.current].killsToLevel;
      $.level.distribution = $.definitions.levels[$.level.current].distribution;
      $.level.distributionCount = $.level.distribution.length;
    } else {
      $.level.current++;
      $.level.kills = 0;
      // no more level definitions, so take the last level and increase the spawn rate slightly
      //for( var i = 0; i < $.level.distributionCount; i++ ) {
      //$.level.distribution[ i ] = Math.max( 1, $.level.distribution[ i ] - 5 );
      //}
    }
    $.levelDiffOffset = $.level.current + 1 - $.levelCount;
    $.levelPops.push(new $.LevelPop({
      level: $.level.current + 1
    }));
  }
};

$.updatePowerupTimers = function() {
  // HEALTH
  if ($.powerupTimers[0] > 0) {
    if ($.hero.life < 1) {
      $.hero.life += 0.001;
    }
    if ($.hero.life > 1) {
      $.hero.life = 1;
    }
    $.powerupTimers[0] -= $.dt;
  }

  // SLOW ENEMIES
  if ($.powerupTimers[1] > 0) {
    $.slow = 1;
    $.powerupTimers[1] -= $.dt;
  } else {
    $.slow = 0;
  }

  // FAST SHOT
  if ($.powerupTimers[2] > 0) {
    $.hero.weapon.fireRate = 2;
    $.hero.weapon.bullet.speed = 14;
    $.powerupTimers[2] -= $.dt;
  } else {
    $.hero.weapon.fireRate = 5;
    $.hero.weapon.bullet.speed = 10;
  }

  // TRIPLE SHOT
  if ($.powerupTimers[3] > 0) {
    $.hero.weapon.count = 3;
    $.powerupTimers[3] -= $.dt;
  } else {
    $.hero.weapon.count = 1;
  }

  // PIERCE SHOT
  if ($.powerupTimers[4] > 0) {
    $.hero.weapon.bullet.piercing = 1;
    $.powerupTimers[4] -= $.dt;
  } else {
    $.hero.weapon.bullet.piercing = 0;
  }
};

$.spawnPowerup = function(x, y) {
  if (Math.random() < 0.1) {
    var min = ($.hero.life < 0.9) ? 0 : 1,
      type = Math.floor($.util.rand(min, $.definitions.powerups.length)),
      params = $.definitions.powerups[type];
    params.type = type;
    params.x = x;
    params.y = y;
    $.powerups.push(new $.Powerup(params));
  }
};

/*==============================================================================
States
==============================================================================*/
$.setState = function(state) {
  // handle clean up between states
  $.buttons.length = 0;

  if (state == 'menu') {
    $.mouse.down = 0;
    $.mouse.ax = 0;
    $.mouse.ay = 0;

    $.reset();

    var playButton = new $.Button({
      x: $.cw / 2 + 1,
      y: $.ch / 2 - 24,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'PLAY',
      action: function() {
        $.reset();
        $.audio.play('levelup');
        $.setState('play');
      }
    });
    $.buttons.push(playButton);

    var statsButton = new $.Button({
      x: $.cw / 2 + 1,
      y: playButton.ey + 25,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'STATS',
      action: function() {
        $.setState('stats');
      }
    });
    $.buttons.push(statsButton);

    var creditsButton = new $.Button({
      x: $.cw / 2 + 1,
      y: statsButton.ey + 26,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'CREDITS',
      action: function() {
        $.setState('credits');
      }
    });
    $.buttons.push(creditsButton);
  }

  if (state == 'stats') {
    $.mouse.down = 0;

    var clearButton = new $.Button({
      x: $.cw / 2 + 1,
      y: 426,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'CLEAR DATA',
      action: function() {
        $.mouse.down = 0;
        if (window.confirm('Are you sure you want to clear all locally stored game data? This cannot be undone.')) {
          $.clearStorage();
          $.mouse.down = 0;
        }
      }
    });
    $.buttons.push(clearButton);

    var menuButton = new $.Button({
      x: $.cw / 2 + 1,
      y: clearButton.ey + 25,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'MENU',
      action: function() {
        $.setState('menu');
      }
    });
    $.buttons.push(menuButton);
  }

  if (state == 'credits') {
    $.mouse.down = 0;

    var js13kButton = new $.Button({
      x: $.cw / 2 + 1,
      y: 476,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'JS13KGAMES',
      action: function() {
        location.href = 'http://js13kgames.com';
        $.mouse.down = 0;
      }
    });
    $.buttons.push(js13kButton);

    var menuButton = new $.Button({
      x: $.cw / 2 + 1,
      y: js13kButton.ey + 25,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'MENU',
      action: function() {
        $.setState('menu');
      }
    });
    $.buttons.push(menuButton);
  }

  if (state == 'pause') {
    $.mouse.down = 0;
    $.screenshot = $.ctxmg.getImageData(0, 0, $.cw, $.ch);
    var resumeButton = new $.Button({
      x: $.cw / 2 + 1,
      y: $.ch / 2 + 26,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'RESUME',
      action: function() {
        $.lt = Date.now() + 1000;
        $.setState('play');
      }
    });
    $.buttons.push(resumeButton);

    var menuButton = new $.Button({
      x: $.cw / 2 + 1,
      y: resumeButton.ey + 25,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'MENU',
      action: function() {
        $.mouse.down = 0;
        if (window.confirm('Are you sure you want to end this game and return to the menu?')) {
          $.mousescreen();
          $.setState('menu');
        }
      }
    });
    $.buttons.push(menuButton);
  }

  if (state == 'gameover') {
    $.mouse.down = 0;

    $.screenshot = $.ctxmg.getImageData(0, 0, $.cw, $.ch);
    var resumeButton = new $.Button({
      x: $.cw / 2 + 1,
      y: 426,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'PLAY AGAIN',
      action: function() {
        $.reset();
        $.audio.play('levelup');
        $.setState('play');
      }
    });
    $.buttons.push(resumeButton);

    var menuButton = new $.Button({
      x: $.cw / 2 + 1,
      y: resumeButton.ey + 25,
      lockedWidth: 299,
      lockedHeight: 49,
      scale: 3,
      title: 'MENU',
      action: function() {
        $.setState('menu');
      }
    });
    $.buttons.push(menuButton);

    $.storage['score'] = Math.max($.storage['score'], $.score);
    $.storage['level'] = Math.max($.storage['level'], $.level.current);
    $.storage['rounds'] += 1;
    $.storage['kills'] += $.kills;
    $.storage['bullets'] += $.bulletsFired;
    $.storage['powerups'] += $.powerupsCollected;
    $.storage['time'] += Math.floor($.elapsed);
    $.updateStorage();
  }

  // set state
  $.state = state;
};

$.setupStates = function() {
  $.states['menu'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = 'hidden';

    $.clearScreen();
    $.updateScreen();

    var i = $.buttons.length;
    while (i--) { $.buttons[i].update(i) }
    i = $.buttons.length;
    while (i--) { $.buttons[i].render(i) }

    $.ctxmg.beginPath();
    var title = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: $.ch / 2 - 100,
      text: 'RADIUS RAID',
      hspacing: 2,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 10,
      snap: 1,
      render: 1
    });
    gradient = $.ctxmg.createLinearGradient(title.sx, title.sy, title.sx, title.ey);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#999');
    $.ctxmg.fillStyle = gradient;
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var bottomInfo = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: $.ch - 172,
      text: 'CREATED BY JACK RUGILE FOR JS13KGAMES 2013',
      hspacing: 1,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 1,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = '#666';
    $.ctxmg.fill();

  };

  $.states['stats'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = 'hidden';

    $.clearScreen();

    $.ctxmg.beginPath();
    var statsTitle = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: 150,
      text: 'STATS',
      hspacing: 3,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 10,
      snap: 1,
      render: 1
    });
    var gradient = $.ctxmg.createLinearGradient(statsTitle.sx, statsTitle.sy, statsTitle.sx, statsTitle.ey);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#999');
    $.ctxmg.fillStyle = gradient;
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var statKeys = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 - 10,
      y: statsTitle.ey + 39,
      text: 'BEST SCORE\nBEST LEVEL\nROUNDS PLAYED\nENEMIES KILLED\nBULLETS FIRED\nPOWERUPS COLLECTED\nTIME ELAPSED',
      hspacing: 1,
      vspacing: 17,
      halign: 'right',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var statsValues = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 + 10,
      y: statsTitle.ey + 39,
      text: $.util.commas($.storage['score']) + '\n' +
        ($.storage['level'] + 1) + '\n' +
        $.util.commas($.storage['rounds']) + '\n' +
        $.util.commas($.storage['kills']) + '\n' +
        $.util.commas($.storage['bullets']) + '\n' +
        $.util.commas($.storage['powerups']) + '\n' +
        $.util.convertTime(($.storage['time'] * (1000 / 60)) / 1000),
      hspacing: 1,
      vspacing: 17,
      halign: 'left',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = '#fff';
    $.ctxmg.fill();

    var i = $.buttons.length;
    while (i--) { $.buttons[i].render(i) }
    i = $.buttons.length;
    while (i--) { $.buttons[i].update(i) }
  };

  $.states['credits'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = 'hidden';

    $.clearScreen();

    $.ctxmg.beginPath();
    var creditsTitle = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: 100,
      text: 'CREDITS',
      hspacing: 3,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 10,
      snap: 1,
      render: 1
    });
    var gradient = $.ctxmg.createLinearGradient(creditsTitle.sx, creditsTitle.sy, creditsTitle.sx, creditsTitle.ey);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#999');
    $.ctxmg.fillStyle = gradient;
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var creditKeys = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 - 10,
      y: creditsTitle.ey + 49,
      text: 'CREATED FOR JS13KGAMES BY\nINSPIRATION AND SUPPORT\n\nAUDIO PROCESSING\nGAME INSPIRATION AND IDEAS\n\nHTML5 CANVAS REFERENCE\n\nGAME MATH REFERENCE',
      hspacing: 1,
      vspacing: 17,
      halign: 'right',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var creditValues = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 + 10,
      y: creditsTitle.ey + 49,
      text: '@JACKRUGILE\n@REZONER, @LOKTAR00, @END3R,\n@AUSTINHALLOCK, @CHANDLERPRALL\nJSFXR BY @MARKUSNEUBRAND\nASTEROIDS, CELL WARFARE,\nSPACE PIPS, AND MANY MORE\nNIHILOGIC HTML5\nCANVAS CHEAT SHEET\nBILLY LAMBERTA FOUNDATION\nHTML5 ANIMATION WITH JAVASCRIPT',
      hspacing: 1,
      vspacing: 17,
      halign: 'left',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = '#fff';
    $.ctxmg.fill();

    var i = $.buttons.length;
    while (i--) { $.buttons[i].render(i) }
    i = $.buttons.length;
    while (i--) { $.buttons[i].update(i) }
  };

  $.states['play'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = TouchCompat.supported ? 'visible' : 'hidden';

    $.updateDelta();
    $.updateScreen();
    $.updateLevel();
    $.updatePowerupTimers();
    $.spawnEnemies();
    $.enemyOffsetMod += ($.slow) ? $.dt / 3 : $.dt;

    // update entities
    var i = $.enemies.length;
    while (i--) { $.enemies[i].update(i) }
    i = $.explosions.length;
    while (i--) { $.explosions[i].update(i) }
    i = $.powerups.length;
    while (i--) { $.powerups[i].update(i) }
    i = $.particleEmitters.length;
    while (i--) { $.particleEmitters[i].update(i) }
    i = $.textPops.length;
    while (i--) { $.textPops[i].update(i) }
    i = $.levelPops.length;
    while (i--) { $.levelPops[i].update(i) }
    i = $.bullets.length;
    while (i--) { $.bullets[i].update(i) }
    $.hero.update();

    // render entities
    $.clearScreen();
    $.ctxmg.save();
    $.ctxmg.translate($.screen.x - $.rumble.x, $.screen.y - $.rumble.y);
    i = $.enemies.length;
    while (i--) { $.enemies[i].render(i) }
    i = $.explosions.length;
    while (i--) { $.explosions[i].render(i) }
    i = $.powerups.length;
    while (i--) { $.powerups[i].render(i) }
    i = $.particleEmitters.length;
    while (i--) { $.particleEmitters[i].render(i) }
    i = $.textPops.length;
    while (i--) { $.textPops[i].render(i) }
    i = $.bullets.length;
    while (i--) { $.bullets[i].render(i) }
    $.hero.render();
    $.ctxmg.restore();
    i = $.levelPops.length;
    while (i--) { $.levelPops[i].render(i) }
    $.renderInterface();
    $.renderMinimap();

    // handle gameover
    if ($.hero.life <= 0) {
      var alpha = (($.gameoverTick / $.gameoverTickMax) * 0.8);
      alpha = Math.min(1, Math.max(0, alpha));
      $.ctxmg.fillStyle = 'hsla(0, 100%, 0%, ' + alpha + ')';
      $.ctxmg.fillRect(0, 0, $.cw, $.ch);
      if ($.gameoverTick < $.gameoverTickMax) {
        $.gameoverTick += $.dt;
      } else {
        $.setState('gameover');
      }

      if (!$.gameoverExplosion) {
        $.audio.play('death');
        $.rumble.level = 25;
        $.explosions.push(new $.Explosion({
          x: $.hero.x + $.util.rand(-10, 10),
          y: $.hero.y + $.util.rand(-10, 10),
          radius: 50,
          hue: 0,
          saturation: 0
        }));
        $.particleEmitters.push(new $.ParticleEmitter({
          x: $.hero.x,
          y: $.hero.y,
          count: 45,
          spawnRange: 10,
          friction: 0.95,
          minSpeed: 2,
          maxSpeed: 20,
          minDirection: 0,
          maxDirection: $.twopi,
          hue: 0,
          saturation: 0
        }));
        for (var i = 0; i < $.powerupTimers.length; i++) {
          $.powerupTimers[i] = 0;
        }
        $.gameoverExplosion = 1;
      }
    }

    // update tick
    $.tick += $.dt;

    // listen for pause
    if ($.keys.pressed.p) {
      $.setState('pause');
    }

    // always listen for autofire toggle
    if ($.keys.pressed.f) {
      $.autofire = ~~!$.autofire;
      $.storage['autofire'] = $.autofire;
      $.updateStorage();
    }
  };

  $.states['pause'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = 'hidden';

    $.clearScreen();
    $.ctxmg.putImageData($.screenshot, 0, 0);

    $.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 0.4)';
    $.ctxmg.fillRect(0, 0, $.cw, $.ch);

    $.ctxmg.beginPath();
    var pauseText = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: $.ch / 2 - 50,
      text: 'PAUSED',
      hspacing: 3,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 10,
      snap: 1,
      render: 1
    });
    var gradient = $.ctxmg.createLinearGradient(pauseText.sx, pauseText.sy, pauseText.sx, pauseText.ey);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#999');
    $.ctxmg.fillStyle = gradient;
    $.ctxmg.fill();

    var i = $.buttons.length;
    while (i--) { $.buttons[i].render(i) }
    i = $.buttons.length;
    while (i--) { $.buttons[i].update(i) }

    if ($.keys.pressed.p) {
      $.setState('play');
    }
  };

  $.states['gameover'] = function() {
    $.leftJoystick.style.visibility = $.rightJoystick.style.visibility = 'hidden';

    $.clearScreen();
    $.ctxmg.putImageData($.screenshot, 0, 0);

    var i = $.buttons.length;
    while (i--) { $.buttons[i].update(i) }
    i = $.buttons.length;
    while (i--) { $.buttons[i].render(i) }

    $.ctxmg.beginPath();
    var gameoverTitle = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2,
      y: 150,
      text: 'GAME OVER',
      hspacing: 3,
      vspacing: 1,
      halign: 'center',
      valign: 'bottom',
      scale: 10,
      snap: 1,
      render: 1
    });
    var gradient = $.ctxmg.createLinearGradient(gameoverTitle.sx, gameoverTitle.sy, gameoverTitle.sx, gameoverTitle.ey);
    gradient.addColorStop(0, '#f22');
    gradient.addColorStop(1, '#b00');
    $.ctxmg.fillStyle = gradient;
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var gameoverStatsKeys = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 - 10,
      y: gameoverTitle.ey + 51,
      text: 'SCORE\nLEVEL\nKILLS\nBULLETS\nPOWERUPS\nTIME',
      hspacing: 1,
      vspacing: 17,
      halign: 'right',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
    $.ctxmg.fill();

    $.ctxmg.beginPath();
    var gameoverStatsValues = $.text({
      ctx: $.ctxmg,
      x: $.cw / 2 + 10,
      y: gameoverTitle.ey + 51,
      text: $.util.commas($.score) + '\n' +
        ($.level.current + 1) + '\n' +
        $.util.commas($.kills) + '\n' +
        $.util.commas($.bulletsFired) + '\n' +
        $.util.commas($.powerupsCollected) + '\n' +
        $.util.convertTime(($.elapsed * (1000 / 60)) / 1000),
      hspacing: 1,
      vspacing: 17,
      halign: 'left',
      valign: 'top',
      scale: 2,
      snap: 1,
      render: 1
    });
    $.ctxmg.fillStyle = '#fff';
    $.ctxmg.fill();
  };
}

/*==============================================================================
Loop
==============================================================================*/
$.loop = function() {
  requestAnimFrame($.loop);

  // setup the pressed state for all keys
  for (var k in $.keys.state) {
    if ($.keys.state[k] && !$.okeys[k]) {
      $.keys.pressed[k] = 1;
    } else {
      $.keys.pressed[k] = 0;
    }
  }

  // run the current state
  $.states[$.state]();

  // always listen for mute toggle
  if ($.keys.pressed.m) {
    $.mute = ~~!$.mute;
    var i = $.audio.references.length;
    while (i--) {
      $.audio.references[i].volume = ~~!$.mute;
    }
    $.storage['mute'] = $.mute;
    $.updateStorage();
  }

  // move current keys into old keys
  $.okeys = {};
  for (var k in $.keys.state) {
    $.okeys[k] = $.keys.state[k];
  }
};

/*==============================================================================
Start Game on Load
==============================================================================*/
window.addEventListener('load', function() {
  document.documentElement.className += ' loaded';
  $.init();
});PK"Lvb�  b�  PK   ���W               hero.js/*==============================================================================
Init
==============================================================================*/
$.Hero = function() {
  this.x = $.ww / 2;
  this.y = $.wh / 2;
  this.vx = 0;
  this.vy = 0;
  this.vmax = 4;
  this.vmax = 6;
  this.direction = 0;
  this.accel = 0.5;
  this.radius = 10;
  this.life = 1;
  this.takingDamage = 0;
  this.fillStyle = '#fff';
  this.weapon = {
    fireRate: 5,
    fireRateTick: 5,
    spread: 0.3,
    count: 1,
    bullet: {
      size: 15,
      lineWidth: 2,
      damage: 1,
      speed: 10,
      piercing: 0,
      strokeStyle: '#fff'
    },
    fireFlag: 0
  };
};

/*==============================================================================
Update
==============================================================================*/
$.Hero.prototype.update = function() {
  if (this.life > 0) {
    /*==============================================================================
    Apply Forces
    ==============================================================================*/
    if ($.keys.state.up) {
      this.vy -= this.accel * $.dt;
      if (this.vy < -this.vmax) {
        this.vy = -this.vmax;
      }
    } else if ($.keys.state.down) {
      this.vy += this.accel * $.dt;
      if (this.vy > this.vmax) {
        this.vy = this.vmax;
      }
    }
    if ($.keys.state.left) {
      this.vx -= this.accel * $.dt;
      if (this.vx < -this.vmax) {
        this.vx = -this.vmax;
      }
    } else if ($.keys.state.right) {
      this.vx += this.accel * $.dt;
      if (this.vx > this.vmax) {
        this.vx = this.vmax;
      }
    }

    this.vy *= 0.9;
    this.vx *= 0.9;

    this.x += this.vx * $.dt;
    this.y += this.vy * $.dt;

    /*==============================================================================
    Lock Bounds
    ==============================================================================*/
    if (this.x >= $.ww - this.radius) {
      this.x = $.ww - this.radius;
    }
    if (this.x <= this.radius) {
      this.x = this.radius;
    }
    if (this.y >= $.wh - this.radius) {
      this.y = $.wh - this.radius;
    }
    if (this.y <= this.radius) {
      this.y = this.radius;
    }

    /*==============================================================================
    Update Direction
    ==============================================================================*/
    var dx = $.mouse.x - this.x,
      dy = $.mouse.y - this.y;
    this.direction = Math.atan2(dy, dx);

    /*==============================================================================
    Fire Weapon
    ==============================================================================*/
    if (this.weapon.fireRateTick < this.weapon.fireRate) {
      this.weapon.fireRateTick += $.dt;
    } else {
      if ($.autofire || (!$.autofire && $.mouse.down)) {
        $.audio.play('shoot');
        if ($.powerupTimers[2] > 0 || $.powerupTimers[3] > 0 || $.powerupTimers[4] > 0) {
          $.audio.play('shootAlt');
        }

        this.weapon.fireRateTick = this.weapon.fireRateTick - this.weapon.fireRate;
        this.weapon.fireFlag = 6;

        if (this.weapon.count > 1) {
          var spreadStart = -this.weapon.spread / 2;
          var spreadStep = this.weapon.spread / (this.weapon.count - 1);
        } else {
          var spreadStart = 0;
          var spreadStep = 0;
        }

        var gunX = this.x + Math.cos(this.direction) * (this.radius + this.weapon.bullet.size);
        var gunY = this.y + Math.sin(this.direction) * (this.radius + this.weapon.bullet.size);

        for (var i = 0; i < this.weapon.count; i++) {
          $.bulletsFired++;
          var color = this.weapon.bullet.strokeStyle;
          if ($.powerupTimers[2] > 0 || $.powerupTimers[3] > 0 || $.powerupTimers[4] > 0) {
            var colors = [];
            if ($.powerupTimers[2] > 0) { colors.push('hsl(' + $.definitions.powerups[2].hue + ', ' + $.definitions.powerups[2].saturation + '%, ' + $.definitions.powerups[2].lightness + '%)'); }
            if ($.powerupTimers[3] > 0) { colors.push('hsl(' + $.definitions.powerups[3].hue + ', ' + $.definitions.powerups[3].saturation + '%, ' + $.definitions.powerups[3].lightness + '%)'); }
            if ($.powerupTimers[4] > 0) { colors.push('hsl(' + $.definitions.powerups[4].hue + ', ' + $.definitions.powerups[4].saturation + '%, ' + $.definitions.powerups[4].lightness + '%)'); }
            color = colors[Math.floor($.util.rand(0, colors.length))];
          }
          $.bullets.push(new $.Bullet({
            x: gunX,
            y: gunY,
            speed: this.weapon.bullet.speed,
            direction: this.direction + spreadStart + i * spreadStep,
            damage: this.weapon.bullet.damage,
            size: this.weapon.bullet.size,
            lineWidth: this.weapon.bullet.lineWidth,
            strokeStyle: color,
            piercing: this.weapon.bullet.piercing
          }));
        }
      }
    }

    /*==============================================================================
    Check Collisions
    ==============================================================================*/
    this.takingDamage = 0;
    var ei = $.enemies.length;
    while (ei--) {
      var enemy = $.enemies[ei];
      if (enemy.inView && $.util.distance(this.x, this.y, enemy.x, enemy.y) <= this.radius + enemy.radius) {
        $.particleEmitters.push(new $.ParticleEmitter({
          x: this.x,
          y: this.y,
          count: 2,
          spawnRange: 0,
          friction: 0.85,
          minSpeed: 2,
          maxSpeed: 15,
          minDirection: 0,
          maxDirection: $.twopi,
          hue: 0,
          saturation: 0
        }));
        this.takingDamage = 1;
        this.life -= 0.0075;
        $.rumble.level = 3;
        if (Math.floor($.tick) % 5 == 0) {
          $.audio.play('takingDamage');
        }
      }
    }
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Hero.prototype.render = function() {
  if (this.life > 0) {
    if (this.takingDamage) {
      var fillStyle = 'hsla(0, 0%, ' + $.util.rand(0, 100) + '%, 1)';
      $.ctxmg.fillStyle = 'hsla(0, 0%, ' + $.util.rand(0, 100) + '%, ' + $.util.rand(0.01, 0.15) + ')';
      $.ctxmg.fillRect(-$.screen.x, -$.screen.y, $.cw, $.ch);
    } else if (this.weapon.fireFlag > 0) {
      this.weapon.fireFlag -= $.dt;
      var fillStyle = 'hsla(' + $.util.rand(0, 359) + ', 100%, ' + $.util.rand(20, 80) + '%, 1)';
    } else {
      var fillStyle = this.fillStyle;
    }

    $.ctxmg.save();
    $.ctxmg.translate(this.x, this.y);
    $.ctxmg.rotate(this.direction - $.pi / 4);
    $.ctxmg.fillStyle = fillStyle;
    $.ctxmg.fillRect(0, 0, this.radius, this.radius);
    $.ctxmg.restore();

    $.ctxmg.save();
    $.ctxmg.translate(this.x, this.y);
    $.ctxmg.rotate(this.direction - $.pi / 4 + $.twopi / 3);
    $.ctxmg.fillStyle = fillStyle;
    $.ctxmg.fillRect(0, 0, this.radius, this.radius);
    $.ctxmg.restore();

    $.ctxmg.save();
    $.ctxmg.translate(this.x, this.y);
    $.ctxmg.rotate(this.direction - $.pi / 4 - $.twopi / 3);
    $.ctxmg.fillStyle = fillStyle;
    $.ctxmg.fillRect(0, 0, this.radius, this.radius);
    $.ctxmg.restore();

    $.util.fillCircle($.ctxmg, this.x, this.y, this.radius - 3, fillStyle);
  }
};PK�$XY'  '  PK   ���W               jsfxr.jsfunction J() { this.B = function(e) { for (var f = 0; 24 > f; f++) this[String.fromCharCode(97 + f)] = e[f] || 0;
    0.01 > this.c && (this.c = 0.01);
    e = this.b + this.c + this.e;
    0.18 > e && (e = 0.18 / e, this.b *= e, this.c *= e, this.e *= e) } }
var W = new function() {
  this.A = new J;
  var e, f, d, g, l, z, K, L, M, A, m, N;
  this.reset = function() { var c = this.A;
    g = 100 / (c.f * c.f + 0.001);
    l = 100 / (c.g * c.g + 0.001);
    z = 1 - 0.01 * c.h * c.h * c.h;
    K = 1E-6 * -c.i * c.i * c.i;
    c.a || (m = 0.5 - c.n / 2, N = 5E-5 * -c.o);
    L = 0 < c.l ? 1 - 0.9 * c.l * c.l : 1 + 10 * c.l * c.l;
    M = 0;
    A = 1 == c.m ? 0 : 2E4 * (1 - c.m) * (1 - c.m) + 32 };
  this.D = function() { this.reset(); var c = this.A;
    e = 1E5 * c.b * c.b;
    f = 1E5 * c.c * c.c;
    d = 1E5 * c.e * c.e + 10; return e + f + d | 0 };
  this.C = function(c, O) {
    var a = this.A,
      P = 1 != a.s || a.v,
      r = 0.1 * a.v * a.v,
      Q = 1 + 3E-4 * a.w,
      n = 0.1 * a.s * a.s * a.s,
      X = 1 + 1E-4 * a.t,
      Y = 1 !=
      a.s,
      Z = a.x * a.x,
      $ = a.g,
      R = a.q || a.r,
      aa = 0.2 * a.r * a.r * a.r,
      D = a.q * a.q * (0 > a.q ? -1020 : 1020),
      S = a.p ? (2E4 * (1 - a.p) * (1 - a.p) | 0) + 32 : 0,
      ba = a.d,
      T = a.j / 2,
      ca = 0.01 * a.k * a.k,
      E = a.a,
      F = e,
      da = 1 / e,
      ea = 1 / f,
      fa = 1 / d,
      a = 5 / (1 + 20 * a.u * a.u) * (0.01 + n);
    0.8 < a && (a = 0.8);
    for (var a = 1 - a, G = !1, U = 0, v = 0, w = 0, B = 0, t = 0, x, u = 0, h, p = 0, s, H = 0, b, V = 0, q, I = 0, C = Array(1024), y = Array(32), k = C.length; k--;) C[k] = 0;
    for (k = y.length; k--;) y[k] = 2 * Math.random() - 1;
    for (k = 0; k < O; k++) {
      if (G) return k;
      S && ++V >= S && (V = 0, this.reset());
      A && ++M >= A && (A = 0, g *= L);
      z += K;
      g *= z;
      g > l && (g = l, 0 < $ && (G = !0));
      h = g;
      0 <
        T && (I += ca, h *= 1 + Math.sin(I) * T);
      h |= 0;
      8 > h && (h = 8);
      E || (m += N, 0 > m ? m = 0 : 0.5 < m && (m = 0.5));
      if (++v > F) switch (v = 0, ++U) {
        case 1:
          F = f; break;
        case 2:
          F = d }
      switch (U) {
        case 0:
          w = v * da; break;
        case 1:
          w = 1 + 2 * (1 - v * ea) * ba; break;
        case 2:
          w = 1 - v * fa; break;
        case 3:
          w = 0, G = !0 } R && (D += aa, s = D | 0, 0 > s ? s = -s : 1023 < s && (s = 1023));
      P && Q && (r *= Q, 1E-5 > r ? r = 1E-5 : 0.1 < r && (r = 0.1));
      q = 0;
      for (var ga = 8; ga--;) {
        p++;
        if (p >= h && (p %= h, 3 == E))
          for (x = y.length; x--;) y[x] = 2 * Math.random() - 1;
        switch (E) {
          case 0:
            b = p / h < m ? 0.5 : -0.5;
            break;
          case 1:
            b = 1 - 2 * (p / h);
            break;
          case 2:
            b = p / h;
            b = 0.5 < b ? 6.28318531 *
              (b - 1) : 6.28318531 * b;
            b = 0 > b ? 1.27323954 * b + 0.405284735 * b * b : 1.27323954 * b - 0.405284735 * b * b;
            b = 0 > b ? 0.225 * (b * -b - b) + b : 0.225 * (b * b - b) + b;
            break;
          case 3:
            b = y[Math.abs(32 * p / h | 0)]
        }
        P && (x = u, n *= X, 0 > n ? n = 0 : 0.1 < n && (n = 0.1), Y ? (t += (b - u) * n, t *= a) : (u = b, t = 0), u += t, B += u - x, b = B *= 1 - r);
        R && (C[H % 1024] = b, b += C[(H - s + 1024) % 1024], H++);
        q += b
      }
      q = 0.125 * q * w * Z;
      c[k] = 1 <= q ? 32767 : -1 >= q ? -32768 : 32767 * q | 0
    }
    return O
  }
};
window.jsfxr = function(e) {
  W.A.B(e);
  var f = W.D();
  e = new Uint8Array(4 * ((f + 1) / 2 | 0) + 44);
  var f = 2 * W.C(new Uint16Array(e.buffer, 44), f),
    d = new Uint32Array(e.buffer, 0, 44);
  d[0] = 1179011410;
  d[1] = f + 36;
  d[2] = 1163280727;
  d[3] = 544501094;
  d[4] = 16;
  d[5] = 65537;
  d[6] = 44100;
  d[7] = 88200;
  d[8] = 1048578;
  d[9] = 1635017060;
  d[10] = f;
  for (var f = f + 44, d = 0, g = "data:audio/wav;base64,"; d < f; d += 3) var l = e[d] << 16 | e[d + 1] << 8 | e[d + 2],
    g = g + ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [l >> 18] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [l >>
12 & 63] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [l >> 6 & 63] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" [l & 63]);
  d -= f;
  return g.slice(0, g.length - d) + "==".slice(0, d)
};PK���z�  �  PK   ���W               levelpop.js/*==============================================================================
Init
==============================================================================*/
$.LevelPop = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  this.x = $.cw - 20;
  this.y = $.ch - 20;
  this.tick = 0;
  this.tickMax = 240;
  this.baseAlpha = 0.2;
  if ($.tick != 0) {
    $.audio.play('levelup');
  }
};

/*==============================================================================
Update
==============================================================================*/
$.LevelPop.prototype.update = function(i) {
  if (this.tick >= this.tickMax) {
    $.levelPops.splice(i, 1);
  } else {
    this.tick += $.dt;
  }
};

/*==============================================================================
Render
==============================================================================*/
$.LevelPop.prototype.render = function(i) {
  $.ctxmg.beginPath();
  $.text({
    ctx: $.ctxmg,
    x: this.x,
    y: this.y,
    text: $.util.pad(this.level, 2),
    hspacing: 3,
    vspacing: 0,
    halign: 'right',
    valign: 'bottom',
    scale: 12,
    snap: 1,
    render: 1
  });
  if (this.tick < this.tickMax * 0.25) {
    var alpha = (this.tick / (this.tickMax * 0.25)) * this.baseAlpha;
  } else if (this.tick > this.tickMax - this.tickMax * 0.25) {
    var alpha = ((this.tickMax - this.tick) / (this.tickMax * 0.25)) * this.baseAlpha;
  } else {
    var alpha = this.baseAlpha;
  }
  alpha = Math.min(1, Math.max(0, alpha));

  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
  $.ctxmg.fill();
}PKL>��P  P  PK   ���W               particle.js/*==============================================================================
Init
==============================================================================*/
$.Particle = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
};

/*==============================================================================
Update
==============================================================================*/
$.Particle.prototype.update = function(i) {
  /*==============================================================================
  Apply Forces
  ==============================================================================*/
  this.x += Math.cos(this.direction) * (this.speed * $.dt);
  this.y += Math.sin(this.direction) * (this.speed * $.dt);
  this.ex = this.x - Math.cos(this.direction) * this.speed;
  this.ey = this.y - Math.sin(this.direction) * this.speed;
  this.speed *= this.friction;

  /*==============================================================================
  Lock Bounds
  ==============================================================================*/
  if (!$.util.pointInRect(this.ex, this.ey, 0, 0, $.ww, $.wh) || this.speed <= 0.05) {
    this.parent.splice(i, 1);
  }

  /*==============================================================================
  Update View
  ==============================================================================*/
  if ($.util.pointInRect(this.ex, this.ey, -$.screen.x, -$.screen.y, $.cw, $.ch)) {
    this.inView = 1;
  } else {
    this.inView = 0;
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Particle.prototype.render = function(i) {
  if (this.inView) {
    $.ctxmg.beginPath();
    $.ctxmg.moveTo(this.x, this.y);
    $.ctxmg.lineTo(this.ex, this.ey);
    $.ctxmg.lineWidth = this.lineWidth;
    $.ctxmg.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand(50, 100) + '%, 1)';
    $.ctxmg.stroke();
  }
}PKe��Y    PK   ���W               particleemitter.js/*==============================================================================
Init
==============================================================================*/
$.ParticleEmitter = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  this.particles = [];
  for (var i = 0; i < this.count; i++) {
    var radius = Math.sqrt(Math.random()) * this.spawnRange,
      angle = Math.random() * $.twopi,
      x = this.x + Math.cos(angle) * radius,
      y = this.y + Math.sin(angle) * radius;
    this.particles.push(new $.Particle({
      parent: this.particles,
      x: x,
      y: y,
      speed: $.util.rand(this.minSpeed, this.maxSpeed),
      friction: this.friction,
      direction: $.util.rand(this.minDirection, this.maxDirection),
      lineWidth: $.util.rand(0.5, 1.5),
      hue: this.hue,
      saturation: this.saturation
    }));
  }
};

/*==============================================================================
Update
==============================================================================*/
$.ParticleEmitter.prototype.update = function(i) {
  var i2 = this.particles.length;
  while (i2--) { this.particles[i2].update(i2) }
  if (this.particles.length <= 0) {
    $.particleEmitters.splice(i, 1);
  }
};

/*==============================================================================
Render
==============================================================================*/
$.ParticleEmitter.prototype.render = function(i) {
  var i2 = this.particles.length;
  while (i2--) { this.particles[i2].render(i2) }
};PK�mjT    PK   ���W            
   powerup.js/*==============================================================================
Init
==============================================================================*/
$.Powerup = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  var text = $.text({
    ctx: $.ctxmg,
    x: 0,
    y: 0,
    text: this.title,
    hspacing: 1,
    vspacing: 0,
    halign: 'top',
    valign: 'left',
    scale: 1,
    snap: 0,
    render: 0
  });
  this.hpadding = 8;
  this.vpadding = 8;
  this.width = text.width + this.hpadding * 2;
  this.height = text.height + this.vpadding * 2;
  this.x = this.x - this.width / 2;
  this.y = this.y - this.height / 2;
  this.direction = $.util.rand(0, $.twopi);
  this.speed = $.util.rand(0.5, 2);
};

/*==============================================================================
Update
==============================================================================*/
$.Powerup.prototype.update = function(i) {
  /*==============================================================================
  Apply Forces
  ==============================================================================*/
  this.x += Math.cos(this.direction) * this.speed * $.dt;
  this.y += Math.sin(this.direction) * this.speed * $.dt;

  /*==============================================================================
  Check Bounds
  ==============================================================================*/
  if (!$.util.rectInRect(this.x, this.y, this.width, this.height, 0, 0, $.ww, $.wh)) {
    $.powerups.splice(i, 1);
  }

  /*==============================================================================
  Check Collection Collision
  ==============================================================================*/
  if ($.hero.life > 0 && $.util.arcIntersectingRect($.hero.x, $.hero.y, $.hero.radius + 2, this.x, this.y, this.width, this.height)) {
    $.audio.play('powerup');
    $.powerupTimers[this.type] = 300;
    $.particleEmitters.push(new $.ParticleEmitter({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      count: 15,
      spawnRange: 0,
      friction: 0.85,
      minSpeed: 2,
      maxSpeed: 15,
      minDirection: 0,
      maxDirection: $.twopi,
      hue: 0,
      saturation: 0
    }));
    $.powerups.splice(i, 1);
    $.powerupsCollected++;
  }
};

/*==============================================================================
Render
==============================================================================*/
$.Powerup.prototype.render = function(i) {

  $.ctxmg.fillStyle = '#000';
  $.ctxmg.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
  $.ctxmg.fillStyle = '#555';
  $.ctxmg.fillRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);

  $.ctxmg.fillStyle = '#111';
  $.ctxmg.fillRect(this.x, this.y, this.width, this.height);

  $.ctxmg.beginPath();
  $.text({
    ctx: $.ctxmg,
    x: this.x + this.hpadding,
    y: this.y + this.vpadding + 1,
    text: this.title,
    hspacing: 1,
    vspacing: 0,
    halign: 'top',
    valign: 'left',
    scale: 1,
    snap: 0,
    render: true
  });
  $.ctxmg.fillStyle = '#000';
  $.ctxmg.fill();

  $.ctxmg.beginPath();
  $.text({
    ctx: $.ctxmg,
    x: this.x + this.hpadding,
    y: this.y + this.vpadding,
    text: this.title,
    hspacing: 1,
    vspacing: 0,
    halign: 'top',
    valign: 'left',
    scale: 1,
    snap: 0,
    render: true
  });
  $.ctxmg.fillStyle = 'hsl(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%)';
  $.ctxmg.fill();

  $.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.2)';
  $.ctxmg.fillRect(this.x, this.y, this.width, this.height / 2);

}PK��OD  D  PK   ���W            
   storage.js// local storage helpers - source: http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage/3146971#3146971
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}

Storage.prototype.removeObject = function(key) {
  this.removeItem(key);
}

$.setupStorage = function() {
  $.storage = localStorage.getObject('radiusraid') || {
    'mute': 0,
    'autofire': 0,
    'score': 0,
    'level': 0,
    'rounds': 0,
    'kills': 0,
    'bullets': 0,
    'powerups': 0,
    'time': 0
  };
};

$.updateStorage = function() {
  localStorage.setObject('radiusraid', $.storage);
};

$.clearStorage = function() {
  localStorage.removeObject('radiusraid');
  $.setupStorage();
};PK��U  U  PK   ���W               text.js$.textLine = function(opt) {
  var textLength = opt.text.length,
    size = 5;
  for (var i = 0; i < textLength; i++) {
    var letter = $.definitions.letters[(opt.text.charAt(i))] || $.definitions.letters['unknown'];
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (letter[y][x] === 1) {
          opt.ctx.rect(opt.x + (x * opt.scale) + ((size * opt.scale) + opt.hspacing) * i, opt.y + y * opt.scale, opt.scale, opt.scale);
        }
      }
    }
  }
};

$.text = function(opt) {
  var size = 5,
    letterSize = size * opt.scale,
    lines = opt.text.split('\n'),
    linesCopy = lines.slice(0),
    lineCount = lines.length,
    longestLine = linesCopy.sort(function(a, b) { return b.length - a.length; })[0],
    textWidth = (longestLine.length * letterSize) + ((longestLine.length - 1) * opt.hspacing),
    textHeight = (lineCount * letterSize) + ((lineCount - 1) * opt.vspacing);

  var sx = opt.x,
    sy = opt.y,
    ex = opt.x + textWidth,
    ey = opt.y + textHeight;

  if (opt.halign == 'center') {
    sx = opt.x - textWidth / 2;
    ex = opt.x + textWidth / 2;
  } else if (opt.halign == 'right') {
    sx = opt.x - textWidth;
    ex = opt.x;
  }

  if (opt.valign == 'center') {
    sy = opt.y - textHeight / 2;
    ey = opt.y + textHeight / 2;
  } else if (opt.valign == 'bottom') {
    sy = opt.y - textHeight;
    ey = opt.y;
  }

  var cx = sx + textWidth / 2,
    cy = sy + textHeight / 2;

  if (opt.render) {
    for (var i = 0; i < lineCount; i++) {
      var line = lines[i],
        lineWidth = (line.length * letterSize) + ((line.length - 1) * opt.hspacing),
        x = opt.x,
        y = opt.y + (letterSize + opt.vspacing) * i;

      if (opt.halign == 'center') {
        x = opt.x - lineWidth / 2;
      } else if (opt.halign == 'right') {
        x = opt.x - lineWidth;
      }

      if (opt.valign == 'center') {
        y = y - textHeight / 2;
      } else if (opt.valign == 'bottom') {
        y = y - textHeight;
      }

      if (opt.snap) {
        x = Math.floor(x);
        y = Math.floor(y);
      }

      $.textLine({
        ctx: opt.ctx,
        x: x,
        y: y,
        text: line,
        hspacing: opt.hspacing,
        scale: opt.scale
      });
    }
  }

  return {
    sx: sx,
    sy: sy,
    cx: cx,
    cy: cy,
    ex: ex,
    ey: ey,
    width: textWidth,
    height: textHeight
  }
};PKA���Q	  Q	  PK   ���W            
   textpop.js/*==============================================================================
Init
==============================================================================*/
$.TextPop = function(opt) {
  for (var k in opt) {
    this[k] = opt[k];
  }
  this.alpha = 2;
  this.vy = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.TextPop.prototype.update = function(i) {
  this.vy -= 0.05;
  this.y += this.vy * $.dt;
  this.alpha -= 0.03 * $.dt;

  if (this.alpha <= 0) {
    $.textPops.splice(i, 1);
  }
};

/*==============================================================================
Render
==============================================================================*/
$.TextPop.prototype.render = function(i) {
  $.ctxmg.beginPath();
  $.text({
    ctx: $.ctxmg,
    x: this.x,
    y: this.y,
    text: '+' + this.value,
    hspacing: 1,
    vspacing: 0,
    halign: 'center',
    valign: 'center',
    scale: 2,
    snap: 0,
    render: 1
  });
  $.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, ' + this.alpha + ')';
  $.ctxmg.fill();
}PKn���  �  PK   ���W               touch-compat.js// Converts Touch events to Mouse Events

var TouchCompat = {
  supported: (
    ('ontouchstart' in document) ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || //IE 10
    (window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 0) || //IE >=11
    false
  ),
  init: function() {
    if (TouchCompat.supported) {
      document.addEventListener("touchstart", touchHandler, true);
      document.addEventListener("touchmove", touchHandler, true);
      document.addEventListener("touchend", touchHandler, true);
      document.addEventListener("touchcancel", touchHandler, true);
    }

    function touchHandler(event) {
      var touches = event.changedTouches,
        first = touches[0],
        type = "";
      switch (event.type) {
        case "touchstart": {
          type = "mousedown";
          break;
        }
        case "touchmove": {
          type = "mousemove";
          break;
        }
        case "touchend": {
          type = "mouseup";
          break;
        }
        default: {
          return;
        }
      }
      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0 /*left*/ , null);
      first.target.dispatchEvent(simulatedEvent);
    }
  },
  joystick: function(options) {
    options = options || {};
    options.dataOnly = !TouchCompat.supported || options.dataOnly;
    return nipplejs.create(options);
  }
};

(function(f) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f() } else if (typeof define === "function" && define.amd) { define([], f) } else { var g; if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this } g.nipplejs = f() } })(function() {
  var define, module, exports;
  'use strict';

  // Constants
  var isTouch = !!('ontouchstart' in window);
  var isPointer = window.PointerEvent ? true : false;
  var isMSPointer = window.MSPointerEvent ? true : false;
  var events = {
    touch: {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend, touchcancel'
    },
    mouse: {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    },
    pointer: {
      start: 'pointerdown',
      move: 'pointermove',
      end: 'pointerup, pointercancel'
    },
    MSPointer: {
      start: 'MSPointerDown',
      move: 'MSPointerMove',
      end: 'MSPointerUp'
    }
  };
  var toBind;
  var secondBind = {};
  if (isPointer) {
    toBind = events.pointer;
  } else if (isMSPointer) {
    toBind = events.MSPointer;
  } else if (isTouch) {
    toBind = events.touch;
    secondBind = events.mouse;
  } else {
    toBind = events.mouse;
  }

  ///////////////////////
  ///      UTILS      ///
  ///////////////////////

  var u = {};
  u.distance = function(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return Math.sqrt((dx * dx) + (dy * dy));
  };

  u.angle = function(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return u.degrees(Math.atan2(dy, dx));
  };

  u.findCoord = function(p, d, a) {
    var b = { x: 0, y: 0 };
    a = u.radians(a);
    b.x = p.x - d * Math.cos(a);
    b.y = p.y - d * Math.sin(a);
    return b;
  };

  u.radians = function(a) {
    return a * (Math.PI / 180);
  };

  u.degrees = function(a) {
    return a * (180 / Math.PI);
  };

  u.bindEvt = function(el, arg, handler) {
    var types = arg.split(/[ ,]+/g);
    var type;
    for (var i = 0; i < types.length; i += 1) {
      type = types[i];
      if (el.addEventListener) {
        el.addEventListener(type, handler, false);
      } else if (el.attachEvent) {
        el.attachEvent(type, handler);
      }
    }
  };

  u.unbindEvt = function(el, arg, handler) {
    var types = arg.split(/[ ,]+/g);
    var type;
    for (var i = 0; i < types.length; i += 1) {
      type = types[i];
      if (el.removeEventListener) {
        el.removeEventListener(type, handler);
      } else if (el.detachEvent) {
        el.detachEvent(type, handler);
      }
    }
  };

  u.trigger = function(el, type, data) {
    var evt = new CustomEvent(type, data);
    el.dispatchEvent(evt);
  };

  u.prepareEvent = function(evt) {
    evt.preventDefault();
    return evt.type.match(/^touch/) ? evt.changedTouches : evt;
  };

  u.getScroll = function() {
    var x = (window.pageXOffset !== undefined) ?
      window.pageXOffset :
      (document.documentElement || document.body.parentNode || document.body)
      .scrollLeft;

    var y = (window.pageYOffset !== undefined) ?
      window.pageYOffset :
      (document.documentElement || document.body.parentNode || document.body)
      .scrollTop;
    return {
      x: x,
      y: y
    };
  };

  u.applyPosition = function(el, pos) {
    if (pos.top || pos.right || pos.bottom || pos.left) {
      el.style.top = pos.top;
      el.style.right = pos.right;
      el.style.bottom = pos.bottom;
      el.style.left = pos.left;
    } else {
      el.style.left = pos.x + 'px';
      el.style.top = pos.y + 'px';
    }
  };

  u.getTransitionStyle = function(property, values, time) {
    var obj = u.configStylePropertyObject(property);
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (typeof values === 'string') {
          obj[i] = values + ' ' + time;
        } else {
          var st = '';
          for (var j = 0, max = values.length; j < max; j += 1) {
            st += values[j] + ' ' + time + ', ';
          }
          obj[i] = st.slice(0, -2);
        }
      }
    }
    return obj;
  };

  u.getVendorStyle = function(property, value) {
    var obj = u.configStylePropertyObject(property);
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        obj[i] = value;
      }
    }
    return obj;
  };

  u.configStylePropertyObject = function(prop) {
    var obj = {};
    obj[prop] = '';
    var vendors = ['webkit', 'Moz', 'o'];
    vendors.forEach(function(vendor) {
      obj[vendor + prop.charAt(0).toUpperCase() + prop.slice(1)] = '';
    });
    return obj;
  };

  u.extend = function(objA, objB) {
    for (var i in objB) {
      if (objB.hasOwnProperty(i)) {
        objA[i] = objB[i];
      }
    }
    return objA;
  };

  // Overwrite only what's already present
  u.safeExtend = function(objA, objB) {
    var obj = {};
    for (var i in objA) {
      if (objA.hasOwnProperty(i) && objB.hasOwnProperty(i)) {
        obj[i] = objB[i];
      } else if (objA.hasOwnProperty(i)) {
        obj[i] = objA[i];
      }
    }
    return obj;
  };

  // Map for array or unique item.
  u.map = function(ar, fn) {
    if (ar.length) {
      for (var i = 0, max = ar.length; i < max; i += 1) {
        fn(ar[i]);
      }
    } else {
      fn(ar);
    }
  };

  ///////////////////////
  ///   SUPER CLASS   ///
  ///////////////////////

  function Super() {};

  // Basic event system.
  Super.prototype.on = function(arg, cb) {
    var self = this;
    var types = arg.split(/[ ,]+/g);
    var type;
    self._handlers_ = self._handlers_ || {};

    for (var i = 0; i < types.length; i += 1) {
      type = types[i];
      self._handlers_[type] = self._handlers_[type] || [];
      self._handlers_[type].push(cb);
    }
    return self;
  };

  Super.prototype.off = function(type, cb) {
    var self = this;
    self._handlers_ = self._handlers_ || {};

    if (type === undefined) {
      self._handlers_ = {};
    } else if (cb === undefined) {
      self._handlers_[type] = null;
    } else if (self._handlers_[type] &&
      self._handlers_[type].indexOf(cb) >= 0) {
      self._handlers_[type].splice(self._handlers_[type].indexOf(cb), 1);
    }

    return self;
  };

  Super.prototype.trigger = function(arg, data) {
    var self = this;
    var types = arg.split(/[ ,]+/g);
    var type;
    self._handlers_ = self._handlers_ || {};

    for (var i = 0; i < types.length; i += 1) {
      type = types[i];
      if (self._handlers_[type] && self._handlers_[type].length) {
        self._handlers_[type].forEach(function(handler) {
          handler.call(self, {
            type: type,
            target: self
          }, data);
        });
      }
    }
  };

  // Configuration
  Super.prototype.config = function(options) {
    var self = this;
    self.options = self.defaults || {};
    if (options) {
      self.options = u.safeExtend(self.options, options);
    }
  };

  // Bind internal events.
  Super.prototype.bindEvt = function(el, type) {
    var self = this;
    self._domHandlers_ = self._domHandlers_ || {};

    self._domHandlers_[type] = function() {
      if (typeof self['on' + type] === 'function') {
        self['on' + type].apply(self, arguments);
      } else {
        console.warn('[WARNING] : Missing "on' + type + '" handler.');
      }
    };

    u.bindEvt(el, toBind[type], self._domHandlers_[type]);

    if (secondBind[type]) {
      // Support for both touch and mouse at the same time.
      u.bindEvt(el, secondBind[type], self._domHandlers_[type]);
    }

    return self;
  };

  // Unbind dom events.
  Super.prototype.unbindEvt = function(el, type) {
    var self = this;
    self._domHandlers_ = self._domHandlers_ || {};

    u.unbindEvt(el, toBind[type], self._domHandlers_[type]);

    if (secondBind[type]) {
      // Support for both touch and mouse at the same time.
      u.unbindEvt(el, secondBind[type], self._domHandlers_[type]);
    }

    delete self._domHandlers_[type];

    return this;
  };

  ///////////////////////
  ///   THE NIPPLE    ///
  ///////////////////////

  function Nipple(collection, options) {
    this.identifier = options.identifier;
    this.position = options.position;
    this.frontPosition = options.frontPosition;
    this.collection = collection;

    // Defaults
    this.defaults = {
      size: 100,
      threshold: 0.1,
      color: 'white',
      fadeTime: 250,
      dataOnly: false,
      restJoystick: true,
      restOpacity: 0.5,
      mode: 'dynamic',
      zone: document.body,
      lockX: false,
      lockY: false
    };

    this.config(options);

    // Overwrites
    if (this.options.mode === 'dynamic') {
      this.options.restOpacity = 0;
    }

    this.id = Nipple.id;
    Nipple.id += 1;
    this.buildEl()
      .stylize();

    // Nipple's API.
    this.instance = {
      el: this.ui.el,
      on: this.on.bind(this),
      off: this.off.bind(this),
      show: this.show.bind(this),
      hide: this.hide.bind(this),
      add: this.addToDom.bind(this),
      remove: this.removeFromDom.bind(this),
      destroy: this.destroy.bind(this),
      resetDirection: this.resetDirection.bind(this),
      computeDirection: this.computeDirection.bind(this),
      trigger: this.trigger.bind(this),
      position: this.position,
      frontPosition: this.frontPosition,
      ui: this.ui,
      identifier: this.identifier,
      id: this.id,
      options: this.options
    };

    return this.instance;
  };

  Nipple.prototype = new Super();
  Nipple.constructor = Nipple;
  Nipple.id = 0;

  // Build the dom element of the Nipple instance.
  Nipple.prototype.buildEl = function(options) {
    this.ui = {};

    if (this.options.dataOnly) {
      return this;
    }

    this.ui.el = document.createElement('div');
    this.ui.back = document.createElement('div');
    this.ui.front = document.createElement('div');

    this.ui.el.className = 'nipple collection_' + this.collection.id;
    this.ui.back.className = 'back';
    this.ui.front.className = 'front';

    this.ui.el.setAttribute('id', 'nipple_' + this.collection.id +
      '_' + this.id);

    this.ui.el.appendChild(this.ui.back);
    this.ui.el.appendChild(this.ui.front);

    return this;
  };

  // Apply CSS to the Nipple instance.
  Nipple.prototype.stylize = function() {
    if (this.options.dataOnly) {
      return this;
    }
    var animTime = this.options.fadeTime + 'ms';
    var borderStyle = u.getVendorStyle('borderRadius', '50%');
    var transitStyle = u.getTransitionStyle('transition', 'opacity', animTime);
    var styles = {};
    styles.el = {
      position: 'absolute',
      opacity: this.options.restOpacity,
      display: 'block',
      'zIndex': 999
    };

    styles.back = {
      position: 'absolute',
      display: 'block',
      width: this.options.size + 'px',
      height: this.options.size + 'px',
      marginLeft: -this.options.size / 2 + 'px',
      marginTop: -this.options.size / 2 + 'px',
      background: this.options.color,
      'opacity': '.5'
    };

    styles.front = {
      width: this.options.size / 2 + 'px',
      height: this.options.size / 2 + 'px',
      position: 'absolute',
      display: 'block',
      marginLeft: -this.options.size / 4 + 'px',
      marginTop: -this.options.size / 4 + 'px',
      background: this.options.color,
      'opacity': '.5'
    };

    u.extend(styles.el, transitStyle);
    u.extend(styles.back, borderStyle);
    u.extend(styles.front, borderStyle);

    this.applyStyles(styles);

    return this;
  };

  Nipple.prototype.applyStyles = function(styles) {
    // Apply styles
    for (var i in this.ui) {
      if (this.ui.hasOwnProperty(i)) {
        for (var j in styles[i]) {
          this.ui[i].style[j] = styles[i][j];
        }
      }
    }

    return this;
  };

  // Inject the Nipple instance into DOM.
  Nipple.prototype.addToDom = function() {
    // We're not adding it if we're dataOnly or already in dom.
    if (this.options.dataOnly || document.body.contains(this.ui.el)) {
      return this;
    }
    this.options.zone.appendChild(this.ui.el);
    return this;
  };

  // Remove the Nipple instance from DOM.
  Nipple.prototype.removeFromDom = function() {
    if (this.options.dataOnly || !document.body.contains(this.ui.el)) {
      return this;
    }
    this.options.zone.removeChild(this.ui.el);
    return this;
  };

  // Entirely destroy this nipple
  Nipple.prototype.destroy = function() {
    clearTimeout(this.removeTimeout);
    clearTimeout(this.showTimeout);
    clearTimeout(this.restTimeout);
    this.trigger('destroyed', this.instance);
    this.removeFromDom();
    this.off();
  };

  // Fade in the Nipple instance.
  Nipple.prototype.show = function(cb) {
    var self = this;

    if (self.options.dataOnly) {
      return self;
    }

    clearTimeout(self.removeTimeout);
    clearTimeout(self.showTimeout);
    clearTimeout(self.restTimeout);

    self.addToDom();

    self.restCallback();

    setTimeout(function() {
      self.ui.el.style.opacity = 1;
    }, 0);

    self.showTimeout = setTimeout(function() {
      self.trigger('shown', self.instance);
      if (typeof cb === 'function') {
        cb.call(this);
      }
    }, self.options.fadeTime);

    return self;
  };

  // Fade out the Nipple instance.
  Nipple.prototype.hide = function(cb) {
    var self = this;

    if (self.options.dataOnly) {
      return self;
    }

    self.ui.el.style.opacity = self.options.restOpacity;

    clearTimeout(self.removeTimeout);
    clearTimeout(self.showTimeout);
    clearTimeout(self.restTimeout);

    self.removeTimeout = setTimeout(
      function() {
        var display = self.options.mode === 'dynamic' ? 'none' : 'block';
        self.ui.el.style.display = display;
        if (typeof cb === 'function') {
          cb.call(self);
        }

        self.trigger('hidden', self.instance);
      },
      self.options.fadeTime
    );
    if (self.options.restJoystick) {
      self.restPosition();
    }

    return self;
  };

  Nipple.prototype.restPosition = function(cb) {
    var self = this;
    self.frontPosition = {
      x: 0,
      y: 0
    };
    var animTime = self.options.fadeTime + 'ms';

    var transitStyle = {};
    transitStyle.front = u.getTransitionStyle('transition',
      ['top', 'left'], animTime);

    var styles = { front: {} };
    styles.front = {
      left: self.frontPosition.x + 'px',
      top: self.frontPosition.y + 'px'
    };

    self.applyStyles(transitStyle);
    self.applyStyles(styles);

    self.restTimeout = setTimeout(
      function() {
        if (typeof cb === 'function') {
          cb.call(self);
        }
        self.restCallback();
      },
      self.options.fadeTime
    );
  };

  Nipple.prototype.restCallback = function() {
    var self = this;
    var transitStyle = {};
    transitStyle.front = u.getTransitionStyle('transition', 'none', '');
    self.applyStyles(transitStyle);
    self.trigger('rested', self.instance);
  };

  Nipple.prototype.resetDirection = function() {
    // Fully rebuild the object to let the iteration possible.
    this.direction = {
      x: false,
      y: false,
      angle: false
    };
  };

  Nipple.prototype.computeDirection = function(obj) {
    var rAngle = obj.angle.radian;
    var angle45 = Math.PI / 4;
    var angle90 = Math.PI / 2;
    var direction, directionX, directionY;

    // Angular direction
    //     \  UP /
    //      \   /
    // LEFT       RIGHT
    //      /   \
    //     /DOWN \
    //
    if (
      rAngle > angle45 &&
      rAngle < (angle45 * 3) &&
      !obj.lockX
    ) {
      direction = 'up';
    } else if (
      rAngle > -angle45 &&
      rAngle <= angle45 &&
      !obj.lockY
    ) {
      direction = 'left';
    } else if (
      rAngle > (-angle45 * 3) &&
      rAngle <= -angle45 &&
      !obj.lockX
    ) {
      direction = 'down';
    } else if (!obj.lockY) {
      direction = 'right';
    }

    // Plain direction
    //    UP                 |
    // _______               | RIGHT
    //                  LEFT |
    //   DOWN                |
    if (!obj.lockY) {
      if (rAngle > -angle90 && rAngle < angle90) {
        directionX = 'left';
      } else {
        directionX = 'right';
      }
    }

    if (!obj.lockX) {
      if (rAngle > 0) {
        directionY = 'up';
      } else {
        directionY = 'down';
      }
    }

    if (obj.force > this.options.threshold) {
      var oldDirection = {};
      for (var i in this.direction) {
        if (this.direction.hasOwnProperty(i)) {
          oldDirection[i] = this.direction[i];
        }
      }

      var same = {};

      this.direction = {
        x: directionX,
        y: directionY,
        angle: direction
      };

      obj.direction = this.direction;

      for (var i in oldDirection) {
        if (oldDirection[i] === this.direction[i]) {
          same[i] = true;
        }
      }

      // If all 3 directions are the same, we don't trigger anything.
      if (same.x && same.y && same.angle) {
        return obj;
      }

      if (!same.x || !same.y) {
        this.trigger('plain', obj);
      }

      if (!same.x) {
        this.trigger('plain:' + directionX, obj);
      }

      if (!same.y) {
        this.trigger('plain:' + directionY, obj);
      }

      if (!same.angle) {
        this.trigger('dir dir:' + direction, obj);
      }
    }
    return obj;
  };

  /* global Nipple, Super */

  ///////////////////////////
  ///   THE COLLECTION    ///
  ///////////////////////////

  function Collection(manager, options) {
    var self = this;
    self.nipples = [];
    self.idles = [];
    self.actives = [];
    self.ids = [];
    self.pressureIntervals = {};
    self.manager = manager;
    self.id = Collection.id;
    Collection.id += 1;

    // Defaults
    self.defaults = {
      zone: document.body,
      multitouch: false,
      maxNumberOfNipples: 10,
      mode: 'dynamic',
      position: { top: 0, left: 0 },
      catchDistance: 200,
      size: 100,
      threshold: 0.1,
      color: 'white',
      fadeTime: 250,
      dataOnly: false,
      restJoystick: true,
      restOpacity: 0.5,
      lockX: false,
      lockY: false
    };

    self.config(options);

    // Overwrites
    if (self.options.mode === 'static' || self.options.mode === 'semi') {
      self.options.multitouch = false;
    }

    if (!self.options.multitouch) {
      self.options.maxNumberOfNipples = 1;
    }

    self.updateBox();
    self.prepareNipples();
    self.bindings();
    self.begin();

    return self.nipples;
  }

  Collection.prototype = new Super();
  Collection.constructor = Collection;
  Collection.id = 0;

  Collection.prototype.prepareNipples = function() {
    var self = this;
    var nips = self.nipples;

    // Public API Preparation.
    nips.on = self.on.bind(self);
    nips.off = self.off.bind(self);
    nips.options = self.options;
    nips.destroy = self.destroy.bind(self);
    nips.ids = self.ids;
    nips.id = self.id;
    nips.processOnMove = self.processOnMove.bind(self);
    nips.processOnEnd = self.processOnEnd.bind(self);
    nips.get = function(id) {
      if (id === undefined) {
        return nips[0];
      }
      for (var i = 0, max = nips.length; i < max; i += 1) {
        if (nips[i].identifier === id) {
          return nips[i];
        }
      }
      return false;
    };
  };

  Collection.prototype.bindings = function() {
    var self = this;
    // Touch start event.
    self.bindEvt(self.options.zone, 'start');
    // Avoid native touch actions (scroll, zoom etc...) on the zone.
    self.options.zone.style.touchAction = 'none';
    self.options.zone.style.msTouchAction = 'none';
  };

  Collection.prototype.begin = function() {
    var self = this;
    var opts = self.options;

    // We place our static nipple
    // if needed.
    if (opts.mode === 'static') {
      var nipple = self.createNipple(
        opts.position,
        self.manager.getIdentifier()
      );
      // Add it to the dom.
      nipple.add();
      // Store it in idles.
      self.idles.push(nipple);
    }
  };

  // Nipple Factory
  Collection.prototype.createNipple = function(position, identifier) {
    var self = this;
    var scroll = u.getScroll();
    var toPutOn = {};
    var opts = self.options;

    if (position.x && position.y) {
      toPutOn = {
        x: position.x -
          (scroll.x + self.box.left),
        y: position.y -
          (scroll.y + self.box.top)
      };
    } else if (
      position.top ||
      position.right ||
      position.bottom ||
      position.left
    ) {

      // We need to compute the position X / Y of the joystick.
      var dumb = document.createElement('DIV');
      dumb.style.display = 'hidden';
      dumb.style.top = position.top;
      dumb.style.right = position.right;
      dumb.style.bottom = position.bottom;
      dumb.style.left = position.left;
      dumb.style.position = 'absolute';

      opts.zone.appendChild(dumb);
      var dumbBox = dumb.getBoundingClientRect();
      opts.zone.removeChild(dumb);

      toPutOn = position;
      position = {
        x: dumbBox.left + scroll.x,
        y: dumbBox.top + scroll.y
      };
    }

    var nipple = new Nipple(self, {
      color: opts.color,
      size: opts.size,
      threshold: opts.threshold,
      fadeTime: opts.fadeTime,
      dataOnly: opts.dataOnly,
      restJoystick: opts.restJoystick,
      restOpacity: opts.restOpacity,
      mode: opts.mode,
      identifier: identifier,
      position: position,
      zone: opts.zone,
      frontPosition: {
        x: 0,
        y: 0
      }
    });

    if (!opts.dataOnly) {
      u.applyPosition(nipple.ui.el, toPutOn);
      u.applyPosition(nipple.ui.front, nipple.frontPosition);
    }
    self.nipples.push(nipple);
    self.trigger('added ' + nipple.identifier + ':added', nipple);
    self.manager.trigger('added ' + nipple.identifier + ':added', nipple);

    self.bindNipple(nipple);

    return nipple;
  };

  Collection.prototype.updateBox = function() {
    var self = this;
    self.box = self.options.zone.getBoundingClientRect();
  };

  Collection.prototype.bindNipple = function(nipple) {
    var self = this;
    var type;
    // Bubble up identified events.
    var handler = function(evt, data) {
      // Identify the event type with the nipple's id.
      type = evt.type + ' ' + data.id + ':' + evt.type;
      self.trigger(type, data);
    };

    // When it gets destroyed.
    nipple.on('destroyed', self.onDestroyed.bind(self));

    // Other events that will get bubbled up.
    nipple.on('shown hidden rested dir plain', handler);
    nipple.on('dir:up dir:right dir:down dir:left', handler);
    nipple.on('plain:up plain:right plain:down plain:left', handler);
  };

  Collection.prototype.pressureFn = function(touch, nipple, identifier) {
    var self = this;
    var previousPressure = 0;
    clearInterval(self.pressureIntervals[identifier]);
    // Create an interval that will read the pressure every 100ms
    self.pressureIntervals[identifier] = setInterval(function() {
      var pressure = touch.force || touch.pressure ||
        touch.webkitForce || 0;
      if (pressure !== previousPressure) {
        nipple.trigger('pressure', pressure);
        self.trigger('pressure ' +
          nipple.identifier + ':pressure', pressure);
        previousPressure = pressure;
      }
    }.bind(self), 100);
  };

  Collection.prototype.onstart = function(evt) {
    var self = this;
    var opts = self.options;
    evt = u.prepareEvent(evt);

    // Update the box position
    self.updateBox();

    var process = function(touch) {
      // If we can create new nipples
      // meaning we don't have more active nipples than we should.
      if (self.actives.length < opts.maxNumberOfNipples) {
        self.processOnStart(touch);
      }
    };

    u.map(evt, process);

    // We ask upstream to bind the document
    // on 'move' and 'end'
    self.manager.bindDocument();
    return false;
  };

  Collection.prototype.processOnStart = function(evt) {
    var self = this;
    var opts = self.options;
    var indexInIdles;
    var identifier = self.manager.getIdentifier(evt);
    var pressure = evt.force || evt.pressure || evt.webkitForce || 0;
    var position = {
      x: evt.pageX,
      y: evt.pageY
    };

    var nipple = self.getOrCreate(identifier, position);

    // Update its touch identifier
    if (nipple.identifier !== identifier) {
      self.manager.removeIdentifier(nipple.identifier);
    }
    nipple.identifier = identifier;

    var process = function(nip) {
      // Trigger the start.
      nip.trigger('start', nip);
      self.trigger('start ' + nip.id + ':start', nip);

      nip.show();
      if (pressure > 0) {
        self.pressureFn(evt, nip, nip.identifier);
      }
      // Trigger the first move event.
      self.processOnMove(evt);
    };

    // Transfer it from idles to actives.
    if ((indexInIdles = self.idles.indexOf(nipple)) >= 0) {
      self.idles.splice(indexInIdles, 1);
    }

    // Store the nipple in the actives array
    self.actives.push(nipple);
    self.ids.push(nipple.identifier);

    if (opts.mode !== 'semi') {
      process(nipple);
    } else {
      // In semi we check the distance of the touch
      // to decide if we have to reset the nipple
      var distance = u.distance(position, nipple.position);
      if (distance <= opts.catchDistance) {
        process(nipple);
      } else {
        nipple.destroy();
        self.processOnStart(evt);
        return;
      }
    }

    return nipple;
  };

  Collection.prototype.getOrCreate = function(identifier, position) {
    var self = this;
    var opts = self.options;
    var nipple;

    // If we're in static or semi, we might already have an active.
    if (/(semi|static)/.test(opts.mode)) {
      // Get the active one.
      // TODO: Multi-touche for semi and static will start here.
      // Return the nearest one.
      nipple = self.idles[0];
      if (nipple) {
        self.idles.splice(0, 1);
        return nipple;
      }

      if (opts.mode === 'semi') {
        // If we're in semi mode, we need to create one.
        return self.createNipple(position, identifier);
      }

      console.warn('Coudln\'t find the needed nipple.');
      return false;
    }
    // In dynamic, we create a new one.
    nipple = self.createNipple(position, identifier);
    return nipple;
  };

  Collection.prototype.processOnMove = function(evt) {
    var self = this;
    var opts = self.options;
    var identifier = self.manager.getIdentifier(evt);
    var nipple = self.nipples.get(identifier);

    if (!nipple) {
      // This is here just for safety.
      // It shouldn't happen.
      console.error('Found zombie joystick with ID ' + identifier);
      self.manager.removeIdentifier(identifier);
      return;
    }

    nipple.identifier = identifier;

    var size = nipple.options.size / 2;
    var pos = {
      x: evt.pageX,
      y: evt.pageY
    };

    var dist = u.distance(pos, nipple.position);
    var angle = u.angle(pos, nipple.position);
    var rAngle = u.radians(angle);
    var force = dist / size;

    // If distance is bigger than nipple's size
    // we clamp the position.
    if (dist > size) {
      dist = size;
      pos = u.findCoord(nipple.position, dist, angle);
    }

    var xPosition = pos.x - nipple.position.x
    var yPosition = pos.y - nipple.position.y

    if (opts.lockX) {
      yPosition = 0
    }
    if (opts.lockY) {
      xPosition = 0
    }

    nipple.frontPosition = {
      x: xPosition,
      y: yPosition
    };

    if (!opts.dataOnly) {
      u.applyPosition(nipple.ui.front, nipple.frontPosition);
    }

    // Prepare event's datas.
    var toSend = {
      identifier: nipple.identifier,
      position: pos,
      force: force,
      pressure: evt.force || evt.pressure || evt.webkitForce || 0,
      distance: dist,
      angle: {
        radian: rAngle,
        degree: angle
      },
      instance: nipple,
      lockX: opts.lockX,
      lockY: opts.lockY
    };

    // Compute the direction's datas.
    toSend = nipple.computeDirection(toSend);

    // Offset angles to follow units circle.
    toSend.angle = {
      radian: u.radians(180 - angle),
      degree: 180 - angle
    };

    // Send everything to everyone.
    nipple.trigger('move', toSend);
    self.trigger('move ' + nipple.id + ':move', toSend);
  };

  Collection.prototype.processOnEnd = function(evt) {
    var self = this;
    var opts = self.options;
    var identifier = self.manager.getIdentifier(evt);
    var nipple = self.nipples.get(identifier);
    var removedIdentifier = self.manager.removeIdentifier(nipple.identifier);

    if (!nipple) {
      return;
    }

    if (!opts.dataOnly) {
      nipple.hide(function() {
        if (opts.mode === 'dynamic') {
          nipple.trigger('removed', nipple);
          self.trigger('removed ' + nipple.id + ':removed', nipple);
          self.manager
            .trigger('removed ' + nipple.id + ':removed', nipple);
          nipple.destroy();
        }
      });
    }

    // Clear the pressure interval reader
    clearInterval(self.pressureIntervals[nipple.identifier]);

    // Reset the direciton of the nipple, to be able to trigger a new direction
    // on start.
    nipple.resetDirection();

    nipple.trigger('end', nipple);
    self.trigger('end ' + nipple.id + ':end', nipple);

    // Remove identifier from our bank.
    if (self.ids.indexOf(nipple.identifier) >= 0) {
      self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
    }

    // Clean our actives array.
    if (self.actives.indexOf(nipple) >= 0) {
      self.actives.splice(self.actives.indexOf(nipple), 1);
    }

    if (/(semi|static)/.test(opts.mode)) {
      // Transfer nipple from actives to idles
      // if we're in semi or static mode.
      self.idles.push(nipple);
    } else if (self.nipples.indexOf(nipple) >= 0) {
      // Only if we're not in semi or static mode
      // we can remove the instance.
      self.nipples.splice(self.nipples.indexOf(nipple), 1);
    }

    // We unbind move and end.
    self.manager.unbindDocument();

    // We add back the identifier of the idle nipple;
    if (/(semi|static)/.test(opts.mode)) {
      self.manager.ids[removedIdentifier.id] = removedIdentifier.identifier;
    }
  };

  // Remove destroyed nipple from the lists
  Collection.prototype.onDestroyed = function(evt, nipple) {
    var self = this;
    if (self.nipples.indexOf(nipple) >= 0) {
      self.nipples.splice(self.nipples.indexOf(nipple), 1);
    }
    if (self.actives.indexOf(nipple) >= 0) {
      self.actives.splice(self.actives.indexOf(nipple), 1);
    }
    if (self.idles.indexOf(nipple) >= 0) {
      self.idles.splice(self.idles.indexOf(nipple), 1);
    }
    if (self.ids.indexOf(nipple.identifier) >= 0) {
      self.ids.splice(self.ids.indexOf(nipple.identifier), 1);
    }

    // Remove the identifier from our bank
    self.manager.removeIdentifier(nipple.identifier);

    // We unbind move and end.
    self.manager.unbindDocument();
  };

  // Cleanly destroy the manager
  Collection.prototype.destroy = function() {
    var self = this;
    self.unbindEvt(self.options.zone, 'start');

    // Destroy nipples.
    self.nipples.forEach(function(nipple) {
      nipple.destroy();
    });

    // Clean 3DTouch intervals.
    for (var i in self.pressureIntervals) {
      if (self.pressureIntervals.hasOwnProperty(i)) {
        clearInterval(self.pressureIntervals[i]);
      }
    }

    // Notify the manager passing the instance
    self.trigger('destroyed', self.nipples);
    // We unbind move and end.
    self.manager.unbindDocument();
    // Unbind everything.
    self.off();
  };

  /* global u, Super, Collection */

  ///////////////////////
  ///     MANAGER     ///
  ///////////////////////

  function Manager(options) {
    var self = this;
    self.ids = {};
    self.index = 0;
    self.collections = [];

    self.config(options);
    self.prepareCollections();

    // Listen for resize, to reposition every joysticks
    var resizeTimer;
    u.bindEvt(window, 'resize', function(evt) {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        var pos;
        var scroll = u.getScroll();
        self.collections.forEach(function(collection) {
          collection.forEach(function(nipple) {
            pos = nipple.el.getBoundingClientRect();
            nipple.position = {
              x: scroll.x + pos.left,
              y: scroll.y + pos.top
            };
          });
        });
      }, 100);
    });

    return self.collections;
  };

  Manager.prototype = new Super();
  Manager.constructor = Manager;

  Manager.prototype.prepareCollections = function() {
    var self = this;
    // Public API Preparation.
    self.collections.create = self.create.bind(self);
    // Listen to anything
    self.collections.on = self.on.bind(self);
    // Unbind general events
    self.collections.off = self.off.bind(self);
    // Destroy everything
    self.collections.destroy = self.destroy.bind(self);
    // Get any nipple
    self.collections.get = function(id) {
      var nipple;
      self.collections.every(function(collection) {
        if (nipple = collection.get(id)) {
          return false;
        }
        return true;
      });
      return nipple;
    };
  };

  Manager.prototype.create = function(options) {
    return this.createCollection(options);
  };

  // Collection Factory
  Manager.prototype.createCollection = function(options) {
    var self = this;
    var collection = new Collection(self, options);

    self.bindCollection(collection);
    self.collections.push(collection);

    return collection;
  };

  Manager.prototype.bindCollection = function(collection) {
    var self = this;
    var type;
    // Bubble up identified events.
    var handler = function(evt, data) {
      // Identify the event type with the nipple's identifier.
      type = evt.type + ' ' + data.id + ':' + evt.type;
      self.trigger(type, data);
    };

    // When it gets destroyed we clean.
    collection.on('destroyed', self.onDestroyed.bind(self));

    // Other events that will get bubbled up.
    collection.on('shown hidden rested dir plain', handler);
    collection.on('dir:up dir:right dir:down dir:left', handler);
    collection.on('plain:up plain:right plain:down plain:left', handler);
  };

  Manager.prototype.bindDocument = function() {
    var self = this;
    // Bind only if not already binded
    if (!self.binded) {
      self.bindEvt(document, 'move')
        .bindEvt(document, 'end');
      self.binded = true;
    }
  };

  Manager.prototype.unbindDocument = function(force) {
    var self = this;
    // If there are no touch left
    // unbind the document.
    if (!Object.keys(self.ids).length || force === true) {
      self.unbindEvt(document, 'move')
        .unbindEvt(document, 'end');
      self.binded = false;
    }
  };

  Manager.prototype.getIdentifier = function(evt) {
    var id;
    // If no event, simple increment
    if (!evt) {
      id = this.index;
    } else {
      // Extract identifier from event object.
      // Unavailable in mouse events so replaced by latest increment.
      id = evt.identifier === undefined ? evt.pointerId : evt.identifier;
      if (id === undefined) {
        id = this.latest || 0;
      }
    }

    if (this.ids[id] === undefined) {
      this.ids[id] = this.index;
      this.index += 1;
    }

    // Keep the latest id used in case we're using an unidentified mouseEvent
    this.latest = id;
    return this.ids[id];
  };

  Manager.prototype.removeIdentifier = function(identifier) {
    var removed = {};
    for (var id in this.ids) {
      if (this.ids[id] === identifier) {
        removed.id = id;
        removed.identifier = this.ids[id];
        delete this.ids[id];
        break;
      }
    }
    return removed;
  };

  Manager.prototype.onmove = function(evt) {
    var self = this;
    self.onAny('move', evt);
    return false;
  };

  Manager.prototype.onend = function(evt) {
    var self = this;
    self.onAny('end', evt);
    return false;
  };

  Manager.prototype.oncancel = function(evt) {
    var self = this;
    self.onAny('end', evt);
    return false;
  };

  Manager.prototype.onAny = function(which, evt) {
    var self = this;
    var id;
    var processFn = 'processOn' + which.charAt(0).toUpperCase() +
      which.slice(1);
    evt = u.prepareEvent(evt);
    var processColl = function(e, id, coll) {
      if (coll.ids.indexOf(id) >= 0) {
        coll[processFn](e);
        // Mark the event to avoid cleaning it later.
        e._found_ = true;
      }
    };
    var processEvt = function(e) {
      id = self.getIdentifier(e);
      u.map(self.collections, processColl.bind(null, e, id));
      // If the event isn't handled by any collection,
      // we need to clean its identifier.
      if (!e._found_) {
        self.removeIdentifier(id);
      }
    };

    u.map(evt, processEvt);

    return false;
  };

  // Cleanly destroy the manager
  Manager.prototype.destroy = function() {
    var self = this;
    self.unbindDocument(true);
    self.ids = {};
    self.index = 0;
    self.collections.forEach(function(collection) {
      collection.destroy();
    });
    self.off();
  };

  // When a collection gets destroyed
  // we clean behind.
  Manager.prototype.onDestroyed = function(evt, coll) {
    var self = this;
    if (self.collections.indexOf(coll) < 0) {
      return false;
    }
    self.collections.splice(self.collections.indexOf(coll), 1);
  };

  var factory = new Manager();
  return {
    create: function(options) {
      return factory.create(options);
    },
    factory: factory
  };
});PK�K��  ��  PK   ���W               util.js/*==============================================================================
Miscellaneous
==============================================================================*/
window['requestAnimFrame'] = function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(a) { window.setTimeout(a, 1E3 / 60) } }();

$.util = {};
$.pi = Math.PI;
$.twopi = $.pi * 2;

/*==============================================================================
Random Range
==============================================================================*/
$.util.rand = function(min, max) {
  return Math.random() * (max - min) + min;
};

/*==============================================================================
Calculations
==============================================================================*/
$.util.distance = function(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x,
    yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};

$.util.rectInRect = function(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
  return !(r2x > r1x + r1w ||
    r2x + r2w < r1x ||
    r2y > r1y + r1h ||
    r2y + r2h < r1y);
};

$.util.arcInRect = function(ax, ay, ar, rx, ry, rw, rh) {
  return !(ax + ar <= rx || ax - ar >= rx + rw || ay + ar <= ry || ay - ar >= ry + rh);
};

$.util.arcIntersectingRect = function(ax, ay, ar, rx, ry, rw, rh) {
  return !(ax <= rx - ar || ax >= rx + rw + ar || ay <= ry - ar || ay >= ry + rh + ar);
};

$.util.pointInRect = function(px, py, rx, ry, rw, rh) {
  return (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh);
};

/*==============================================================================
Shapes
==============================================================================*/
$.util.circle = function(ctx, x, y, radius) {
  var radius = radius <= 0 ? 1 : radius;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, $.twopi, false);
};

$.util.fillCircle = function(ctx, x, y, radius, fillStyle) {
  $.util.circle(ctx, x, y, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
};

$.util.strokeCircle = function(ctx, x, y, radius, strokeStyle, lineWidth) {
  $.util.circle(ctx, x, y, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};

/*==============================================================================
Miscellaneous
==============================================================================*/
$.util.pad = function(amount, digits) {
  amount += '';
  if (amount.length < digits) {
    amount = '0' + amount;
    return $.util.pad(amount, digits);
  } else {
    return amount;
  }
};

$.util.convertTime = function(seconds) {
  var minutes = Math.floor(seconds / 60);
  var seconds = Math.floor(seconds % 60);
  return $.util.pad(minutes, 2) + ':' + $.util.pad(seconds, 2);
};

$.util.commas = function(nStr) {
  nStr += '';
  var x = nStr.split('.'),
    x1 = x[0],
    x2 = x.length > 1 ? '.' + x[1] : '',
    rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
};


$.util.isset = function(prop) {
  return typeof prop != 'undefined';
};PK�+��  �  PK    ���W��J�  �                   audio.jsPK    ���W�E���  �  	             �  bullet.jsPK    ���W+��`  `  	             �  button.jsPK    ���W?��>�J  �J                 definitions.jsPK    ���W���                 Zi  enemy.jsPK    ���W~���  �               ��  explosion.jsPK    ���W"Lvb�  b�               ��  game.jsPK    ���W�$XY'  '               S? hero.jsPK    ���W���z�  �               �\ jsfxr.jsPK    ���WL>��P  P               �n levelpop.jsPK    ���We��Y                 [u particle.jsPK    ���W�mjT                 �} particleemitter.jsPK    ���W��OD  D  
             � powerup.jsPK    ���W��U  U  
             k� storage.jsPK    ���WA���Q	  Q	               �� text.jsPK    ���Wn���  �  
             ~� textpop.jsPK    ���W�K��  ��               w� touch-compat.jsPK    ���W�+��  �               4? util.jsPK      �  �K   