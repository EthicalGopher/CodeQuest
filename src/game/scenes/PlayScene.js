import Phaser from 'phaser';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
        this.lastDirection = 'down';
    }

    create() {
        console.log('Frames:', this.textures.get('player').frameTotal);

        this.player = this.physics.add.sprite(100, 500, 'player', 0);
        this.player.setCollideWorldBounds(true);

        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        this.createPlayerAnimations();
        this.player.anims.play('idle-down');
    }

    createPlayerAnimations() {
        if (this.anims.exists('idle-down')) return;

        this.anims.create({
            key: 'idle-down',
            frames: this.anims.generateFrameNumbers('player', { frames: [  26,27 ] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 130,131,132,133,134,135 ] }),
            frameRate: 10,
            repeat: -1
        });

        // Placeholder animations for other directions (user will specify frames later)
        this.anims.create({
            key: 'idle-up',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 0,1 ] }), // Placeholder
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 108,109,110,111,112 ] }), // Placeholder
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 13,14 ] }), // Placeholder
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 120,121,123,124 ] }), // Placeholder
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-right',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 40,41 ] }), // Placeholder
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', { frames: [ 143,144,145,146,147 ] }), // Placeholder
            frameRate: 10,
            repeat: -1
        });
    }

    playAnim(key) {
        if (!this.player.anims.currentAnim ||
            this.player.anims.currentAnim.key !== key ||
            (this.player.anims.currentAnim.key === key && !this.player.anims.isPlaying)) {
            this.player.anims.play(key);
        }
    }

    update() {
        const speed = 200;
        this.player.setVelocity(0);

        let isMoving = false;

        // Prioritize vertical movement
        if (this.keys.up.isDown) {
            this.player.setVelocityY(-speed);
            this.lastDirection = 'up';
            isMoving = true;
        }
        else if (this.keys.down.isDown) {
            this.player.setVelocityY(speed);
            this.lastDirection = 'down';
            isMoving = true;
        }
        // If no vertical movement, check for horizontal movement
        else if (this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
            this.lastDirection = 'left';
            isMoving = true;
        }
        else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
            this.lastDirection = 'right';
            isMoving = true;
        }

        if (isMoving) {
            this.playAnim(`walk-${this.lastDirection}`);
        } else {
            this.playAnim(`idle-${this.lastDirection}`);
        }
    }
}
