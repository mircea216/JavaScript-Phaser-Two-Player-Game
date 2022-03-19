import Phaser from 'phaser';
import platform from './assets/ground-platform.png';
import reward from './assets/reward.png'
import dudeLeft from './assets/dudes.png'
import dudeRight from './assets/dudes.png'
import background from './assets/background.png';
import arrow from './assets/arrow.png'
import gameOverImage from './assets/gameOver.png'
import sceneBackground from './assets/sceneBackground.jpg'

let leftPlayer;
let rightPlayer;
let stars;
let platforms;
let cursors;
let score = 0;
let scoreText;
let scoreRight = 0;
let scoreTextRight;
let rightEnergies = 50;
let leftEnergies = 50;
let arrows;
let launchedArrow;
let leftEnergiesText;
let rightEnergiesText;
let gameOver = false;
let reloaded = false;

class MyGame extends Phaser.Scene {
    constructor() {
        super('playing');
    }

    preload() {
        this.load.image('background', background);
        this.load.image('platform', platform);
        this.load.image('reward', reward);
        this.load.image('arrow', arrow);
        this.load.spritesheet('dudeLeft', dudeLeft, {frameWidth: 32, frameHeight: 30});
        this.load.spritesheet('dudeRight', dudeRight, {frameWidth: 32, frameHeight: 30});

    }

    create() {
        this.add.image(400, 300, 'background').setScale(5);
        platforms = this.physics.add.staticGroup();

        platforms.create(400, 100, "platform").setScale(1.1, 0.1).refreshBody();
        platforms.create(150, 300, "platform").setScale(1.1, 0.1).refreshBody();
        platforms.create(650, 300, "platform").setScale(1.1, 0.1).refreshBody();
        platforms.create(400, 500, "platform").setScale(1.1, 0.1);
        platforms.create(400, 600, "platform").setScale(5, 0.01);

        leftPlayer = this.physics.add.sprite(50, 200, 'dudeLeft');

        leftPlayer.setBounce(1);
        leftPlayer.setCollideWorldBounds(true);

        rightPlayer = this.physics.add.sprite(780, 200, 'dudeRight');

        rightPlayer.setBounce(1);
        rightPlayer.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dudeLeft', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{key: 'dudeLeft', frame: 4}],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dudeLeft', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dudeRight', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{key: 'dudeRight', frame: 4}],
            frameRate: 20
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dudeRight', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        stars = this.physics.add.group({
            key: 'reward',
            repeat: 9,
            setXY: {x: 100, y: 200, stepX: 70}
        });

        stars.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        arrows = this.physics.add.group({key: 'arrow', repeat: 0});

        cursors = this.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                a: Phaser.Input.Keyboard.KeyCodes.A,
                d: Phaser.Input.Keyboard.KeyCodes.D,
                w: Phaser.Input.Keyboard.KeyCodes.W,
                s: Phaser.Input.Keyboard.KeyCodes.S,
                space: Phaser.Input.Keyboard.KeyCodes.SPACE,
                enter: Phaser.Input.Keyboard.KeyCodes.ENTER
            });

        scoreText = this.add.text(16, 16, 'Score Player One: 0', {fontSize: '20px', fill: '#91763d'});

        leftEnergiesText = this.add.text(16, 36, 'Energies: 50', {fontSize: '20px', fill: '#91763d'});

        scoreTextRight = this.add.text(536, 16, 'Score Player Two: 0',
            {fontSize: '20px', fill: '#91763d'});

        rightEnergiesText = this.add.text(536, 36, 'Energies: 50', {fontSize: '20px', fill: '#91763d'});

        this.physics.add.collider(leftPlayer, platforms);

        this.physics.add.collider(rightPlayer, platforms);

        this.physics.add.collider(stars, platforms);

        this.physics.add.collider(arrows, platforms);

        this.physics.add.overlap(leftPlayer, stars, collectStar, null, this);

        this.physics.add.overlap(rightPlayer, stars, rightCollectStar, null, this);

    }

    update() {
        if (rightEnergies <= 0 || leftEnergies <= 0) {
            gameOver = true;
        }
        if (gameOver === true) {
            reloaded = false;
            this.scene.start('gameOver');
            return;
        }
        if (cursors.left.isDown) {
            rightPlayer.setVelocityX(-200);

            rightPlayer.anims.play('left', true);
        } else if (cursors.right.isDown) {
            rightPlayer.setVelocityX(200);

            rightPlayer.anims.play('right', true);
        } else {
            rightPlayer.setVelocityX(0);

            rightPlayer.anims.play('turn');
        }
        if (cursors.space.isDown) {
            rightArrowShoot();
        }
        if (cursors.up.isDown && rightPlayer.body.touching.down) {
            rightPlayer.setVelocityY(400);
        }

        if (cursors.d.isDown) {
            leftPlayer.setVelocityX(200);
            leftPlayer.anims.play('left', true);

        } else if (cursors.a.isDown) {
            leftPlayer.setVelocityX(-200);
            leftPlayer.anims.play('turn');
        } else {
            leftPlayer.setVelocityX(0);
            leftPlayer.anims.play('left', true);
        }

        if (cursors.w.isDown && leftPlayer.body.touching.down) {
            leftPlayer.setVelocityY(400);
        }

        if (cursors.enter.isDown) {
            leftArrowShoot();
        }
    }
}

function activateStars() {
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function rightArrowShoot() {
    setArrows();
    rightEnergies = rightEnergies - 1;
    rightEnergiesText.setText('Energies: ' + rightEnergies);
    setTimeout(disableArrows, 2000);
}

function leftArrowShoot() {
    setArrows();
    leftEnergies = leftEnergies - 1;
    leftEnergiesText.setText('Energies: ' + leftEnergies);
    setTimeout(disableArrows, 2000);
}


function disableArrows() {
    if (arrows.countActive(true) !== 0) {
        arrows.children.iterate(function (child) {
            child.disableBody(true, true);
        });
    }
}

function collectStar(leftPlayer, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score Player One: ' + score);
    activateStars();
}


function rightCollectStar(rightPlayer, star) {
    star.disableBody(true, true);
    scoreRight += 10;
    scoreTextRight.setText('Score Player Two: ' + scoreRight);
    activateStars();
}

function setArrows() {
    launchedArrow = arrows.create(1, 1, 'arrow');
    launchedArrow.setBounce(0.5);
    launchedArrow.setCollideWorldBounds(true);
    launchedArrow.setVelocity(Phaser.Math.Between(-200, 200), 1);
}

class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }

    preload() {
        this.load.image('gameOverImage', gameOverImage);
        this.load.image('sceneBackground', sceneBackground);
    }

    create() {
        this.add.image(300, 400, 'sceneBackground').setScale(6, 6);
        const logo = this.add.image(400, 300, 'gameOverImage');

        this.tweens.add({
            targets: logo,
            y: 370,
            duration: 2000,
            ease: "Power2",
            yoyo: true,
            loop: -1
        });


        this.add.text(235, 16, 'Apple Hunters', {
            fontSize: '40px',
            fill: '#a9a231',
            boundsAlignH: "center"
        });

        if (leftEnergies <= 0) {
            this.add.text(260, 66, 'Player Two won the game!', {
                fontSize: '20px',
                fill: '#a9a231'
            });
        }

        if (rightEnergies <= 0) {
            this.add.text(260, 66, 'Player One won the game!', {
                fontSize: '20px',
                fill: '#a9a231'
            });
        }

        this.add.text(235, 500, 'Reload the game!', {
            fontSize: '40px',
            fill: '#a9a231',
            boundsAlignH: "center"
        });

    }

    update() {
        if (reloaded === false) {
            this.reloadGame();
        }
    }

    reloadGame() {
        this.time.addEvent({
            delay: 4000,
            loop: false,
            callback: () => {
                this.scene.start('playing');
                leftEnergies = 50;
                rightEnergies = 50;
                score = 0;
                scoreRight = 0;
                gameOver = false;
                reloaded = true;
            }
        });
    }

}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: [MyGame, GameOver]
};

const game = new Phaser.Game(config);
