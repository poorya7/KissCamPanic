const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1d1d1d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

let player;
let hr;
let cursors;
let walls;
let exit;
let kissCam;

const TILE_SIZE = 40;
const MAZE_ROWS = 15;
const MAZE_COLS = 20;

function preload() {
  this.load.image('ceo1', 'sprites/ceo1.png');
  this.load.image('ceo2', 'sprites/ceo2.png');
  this.load.image('hr1', 'sprites/hr1.png');
  this.load.image('hr2', 'sprites/hr2.png');
  this.load.image('kisscam', 'sprites/kisscam.png');

  this.load.image('skin', 'sprites/crowd/skin.png');
  this.load.image('hair', 'sprites/crowd/hair.png');
  this.load.image('shirt', 'sprites/crowd/shirt.png');
  this.load.image('pants', 'sprites/crowd/pants.png');
}


function create() {
  console.log("KissCamPanic initialized!");
  console.log("Assets loaded:",
    this.textures.exists('skin'),
    this.textures.exists('hair'),
    this.textures.exists('shirt'),
    this.textures.exists('pants')
  );

  this.anims.create({
    key: 'ceo_run',
    frames: [{ key: 'ceo1' }, { key: 'ceo2' }],
    frameRate: 6,
    repeat: -1
  });

  this.anims.create({
    key: 'hr_run',
    frames: [{ key: 'hr1' }, { key: 'hr2' }],
    frameRate: 6,
    repeat: -1
  });

  player = this.physics.add.sprite(50, 50, 'ceo1').setScale(0.07);
  player.setCollideWorldBounds(true);

  hr = this.physics.add.sprite(80, 50, 'hr1').setScale(0.07);

  cursors = this.input.keyboard.createCursorKeys();

  walls = this.physics.add.staticGroup();
  generateMaze(this);

  this.physics.add.collider(player, walls);

  exit = this.add.rectangle(750, 550, 40, 40, 0x00ff00);
  this.physics.add.existing(exit, true);
  this.physics.add.overlap(player, exit, handleExit, null, this);

  kissCam = this.physics.add.sprite(750, 50, 'kisscam').setScale(0.07);
  kissCam.body.setCollideWorldBounds(true);

  this.physics.add.collider(kissCam, walls);
  this.physics.add.overlap(player, kissCam, handleCaught, null, this);
}

function update() {
  const speed = 200;
  let moving = false;

  player.body.setVelocity(0);

  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
    player.setFlipX(true);
    hr.setFlipX(true);
    moving = true;
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
    player.setFlipX(false);
    hr.setFlipX(false);
    moving = true;
  }

  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
    moving = true;
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
    moving = true;
  }

  if (moving) {
    if (!player.anims.isPlaying) player.play('ceo_run');
    if (!hr.anims.isPlaying) hr.play('hr_run');
  } else {
    player.anims.stop();
    player.setTexture('ceo1');
    hr.anims.stop();
    hr.setTexture('hr1');
  }

  hr.x = player.x - 30;
  hr.y = player.y + 10;

  const chaseSpeed = 80;

  if (kissCam.x < player.x) kissCam.body.setVelocityX(chaseSpeed);
  else if (kissCam.x > player.x) kissCam.body.setVelocityX(-chaseSpeed);
  else kissCam.body.setVelocityX(0);

  if (kissCam.y < player.y) kissCam.body.setVelocityY(chaseSpeed);
  else if (kissCam.y > player.y) kissCam.body.setVelocityY(-chaseSpeed);
  else kissCam.body.setVelocityY(0);
}

function generateMaze(scene) {
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let col = 0; col < MAZE_COLS; col++) {
      if (Math.random() < 0.3 || row === 0 || row === MAZE_ROWS - 1 || col === 0 || col === MAZE_COLS - 1) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        const scale = 0.07;

        // Create sprites first:
        const skin = scene.add.image(0, 0, 'skin').setScale(scale);
        const hair = scene.add.image(0, 0, 'hair').setScale(scale);
        const shirt = scene.add.image(0, 0, 'shirt').setScale(scale);
        const pants = scene.add.image(0, 0, 'pants').setScale(scale);

        // Apply random tinting:
        skin.setTint(Phaser.Display.Color.GetColor(
          Phaser.Math.Between(200, 255),
          Phaser.Math.Between(180, 140),
          Phaser.Math.Between(140, 100)
        ));

        hair.setTint(Phaser.Display.Color.GetColor(
          Phaser.Math.Between(50, 255),
          Phaser.Math.Between(40, 20),
          Phaser.Math.Between(10, 0)
        ));

        shirt.setTint(Phaser.Display.Color.GetColor(
          Phaser.Math.Between(50, 255),
          Phaser.Math.Between(50, 255),
          Phaser.Math.Between(50, 255)
        ));

        pants.setTint(Phaser.Display.Color.GetColor(
          Phaser.Math.Between(50, 255),
          Phaser.Math.Between(50, 255),
          Phaser.Math.Between(50, 255)
        ));

        // Create container and add sprites as children:
        const crowdMember = scene.add.container(x, y, [skin, hair, shirt, pants]);
        scene.physics.add.existing(crowdMember, true); // true for static body

        // Resize body to match approximate size:
        crowdMember.body.setSize(TILE_SIZE, TILE_SIZE).setOffset(-TILE_SIZE / 2, -TILE_SIZE / 2);

        walls.add(crowdMember);
      }
    }
  }
}



function handleExit() {
  console.log("Player escaped!");
  alert("🎉 You escaped the crowd maze! (Next level coming soon)");
  player.x = 50;
  player.y = 50;
  kissCam.x = 750;
  kissCam.y = 50;
}

function handleCaught() {
  console.log("Kiss Cam caught the player!");
  alert("😱 Caught by the Kiss Cam!");
  player.x = 50;
  player.y = 50;
  kissCam.x = 750;
  kissCam.y = 50;
}
