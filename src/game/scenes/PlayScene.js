import Phaser from 'phaser';
import { supabase } from '../../supabaseClient';

export class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');

        this.player = null;
        this.players = {};

        this.lastDirection = 'down';
        this.lastPresenceUpdate = 0;

        this.playerId = localStorage.getItem('player_id');
        this.spriteSheet = 'player';
        console.log(this.spriteSheet)
        this.channel = null;
        this.isSubscribed = false;
    }

    // =========================
    // CREATE
    // =========================
    create() {
        // Local player
        this.player = this.physics.add.sprite(100, 500, this.spriteSheet, 0);
        this.player.setCollideWorldBounds(true);

        this.createAnimations();
        this.player.play('idle-down');

        // Input
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        // Multiplayer
        this.setupPresence();

        // Cleanup
        this.events.on('shutdown', () => {
            if (this.channel) {
                supabase.removeChannel(this.channel);
            }
        });
    }

    // =========================
    // PRESENCE
    // =========================
    setupPresence() {
        this.channel = supabase.channel('game-room', {
            config: { presence: { key: this.playerId } }
        });

        this.channel.on('presence', { event: 'sync' }, () => {
            const state = this.channel.presenceState();
            const alive = new Set();

            for (const key in state) {
                const data = state[key][0];
                alive.add(data.uuid);

                if (data.uuid !== this.playerId) {
                    this.upsertRemotePlayer(data);
                }
            }

            // Remove disconnected players
            for (const id in this.players) {
                if (!alive.has(id)) {
                    this.players[id].destroy();
                    delete this.players[id];
                }
            }
        });

        this.channel.subscribe(status => {
            if (status === 'SUBSCRIBED') {
                this.isSubscribed = true;

                this.channel.track({
                    uuid: this.playerId,
                    x: this.player.x,
                    y: this.player.y,
                    animation: 'idle-down',
                    direction: this.lastDirection,
                    sprite_sheet: this.spriteSheet
                });
            }
        });
    }

    // =========================
    // REMOTE PLAYERS
    // =========================
upsertRemotePlayer(data) {
    const sheet = data.sprite_sheet || 'player';

    // 1️⃣ Texture not loaded yet → load it first
    if (!this.textures.exists(sheet)) {
        this.load.spritesheet(sheet, sheet, {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.once('complete', () => {
            this.createAnimations(sheet);
            this.spawnOrUpdateRemote(data);
        });

        this.load.start();
        return;
    }

    // 2️⃣ Texture exists → safe to spawn/update
    this.createAnimations(sheet);
    this.spawnOrUpdateRemote(data);
}
spawnOrUpdateRemote(data) {
    let p = this.players[data.uuid];

    if (!p) {
        p = this.physics.add.sprite(
            data.x,
            data.y,
            data.sprite_sheet,
            0
        );

        p.targetX = data.x;
        p.targetY = data.y;
        this.players[data.uuid] = p;
    } else {
        p.targetX = data.x;
        p.targetY = data.y;
    }

    if (data.animation) {
        p.anims.play(data.animation, true);
    }
}


    // =========================
    // ANIMATIONS
    // =========================
    createAnimations() {
        if (this.anims.exists('idle-down')) return;

        this.anims.create({
            key: 'idle-down',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [26,27] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [130,131,132,133,134,135] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-up',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [0,1] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [108,109,110,111,112] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-left',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [13,14] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [120,121,123,124] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle-right',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [40,41] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers(this.spriteSheet, { frames: [143,144,145,146,147] }),
            frameRate: 10,
            repeat: -1
        });
    }

    // =========================
    // UPDATE LOOP
    // =========================
    update(time) {
        const speed = 200;
        this.player.setVelocity(0);

        let moving = false;

        if (this.keys.up.isDown) {
            this.player.setVelocityY(-speed);
            this.lastDirection = 'up';
            moving = true;
        } else if (this.keys.down.isDown) {
            this.player.setVelocityY(speed);
            this.lastDirection = 'down';
            moving = true;
        } else if (this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
            this.lastDirection = 'left';
            moving = true;
        } else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
            this.lastDirection = 'right';
            moving = true;
        }

        this.player.play(
            moving ? `walk-${this.lastDirection}` : `idle-${this.lastDirection}`,
            true
        );

        // Presence sync (10/sec)
        if (this.isSubscribed && time - this.lastPresenceUpdate > 100) {
            this.lastPresenceUpdate = time;

            this.channel.track({
                uuid: this.playerId,
                x: Math.round(this.player.x),
                y: Math.round(this.player.y),
                animation: this.player.anims.currentAnim?.key,
                direction: this.lastDirection,
                sprite_sheet: this.spriteSheet
            });
        }

        // Interpolate remote players
        for (const id in this.players) {
            const p = this.players[id];
            if (p.targetX !== undefined) {
                p.x = Phaser.Math.Linear(p.x, p.targetX, 0.2);
                p.y = Phaser.Math.Linear(p.y, p.targetY, 0.2);
            }
        }
    }
}
