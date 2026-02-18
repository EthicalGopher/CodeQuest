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
        this.channel = null;
        this.isSubscribed = false;
    }

    // =========================
    // CREATE
    // =========================
async create() {
    const profile = await this.fetchPlayerProfile();
    if (!profile) return;

    this.serverId = profile.server_id;
    this.spriteSheetUrl = profile.sprite_sheet;
    this.spriteSheetKey = `player-${this.playerId}`;

    // Load local spritesheet dynamically
    if (!this.textures.exists(this.spriteSheetKey)) {
        this.load.image(this.spriteSheetKey, this.spriteSheetUrl);

        this.load.once('complete', () => {
            this.generateManualFrames(this.spriteSheetKey);
            this.startGame();
        });
        this.load.start();
    } else {
        this.startGame();
    }
}

    generateManualFrames(textureKey) {
        const texture = this.textures.get(textureKey);
        const width = texture.getSourceImage().width;
        const height = texture.getSourceImage().height;
        const frameWidth = 64;
        const frameHeight = 64;
        const framesPerRow = 14; // Force 14 columns division

        const rows = Math.floor(height / frameHeight);
        const totalFrames = rows * framesPerRow;

        for (let i = 0; i < totalFrames; i++) {
            const x = (i % framesPerRow) * frameWidth;
            const y = Math.floor(i / framesPerRow) * frameHeight;
            
            // Check if coordinates are within image bounds
            if (x + frameWidth <= width && y + frameHeight <= height) {
                texture.add(i, 0, x, y, frameWidth, frameHeight);
            }
        }
    }

    startGame() {
    this.player = this.physics.add.sprite(100, 500, this.spriteSheetKey, 0);
    this.player.setCollideWorldBounds(true);

    this.createAnimations(this.spriteSheetKey);
    this.player.play(`idle-down-${this.spriteSheetKey}`);

    this.keys = this.input.keyboard.addKeys({
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D'
    });

    this.setupPresence();
}

    async fetchPlayerProfile() {
    const { data, error } = await supabase
        .from('player')
        .select('id, sprite_sheet, server_id')
        .eq('id', this.playerId)
        .single();

    if (error) {
        console.error('Failed to load player profile', error);
        return null;
    }

    return data;
}


    // =========================
    // PRESENCE
    // =========================
    setupPresence() {
        this.channel = supabase.channel(`game-room-${this.serverId}`,{
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
                    animation: `idle-down-${this.spriteSheetKey}`,
                    direction: this.lastDirection,
                    sprite_sheet: this.spriteSheetUrl,
                    server_id: this.serverId
                });
            }
        });
    }

    // =========================
    // REMOTE PLAYERS
    // =========================
upsertRemotePlayer(data) {
    const textureKey = `player-${data.uuid}`;
    const spriteUrl = data.sprite_sheet;

    if (!spriteUrl) return;

    // Load sprite sheet if missing
    if (!this.textures.exists(textureKey)) {
        this.load.image(textureKey, spriteUrl);

        this.load.once('complete', () => {
            this.generateManualFrames(textureKey);
            this.createAnimations(textureKey);
            this.spawnOrUpdateRemote(data, textureKey);
        });

        this.load.start();
        return;
    }

    this.spawnOrUpdateRemote(data, textureKey);
}

spawnOrUpdateRemote(data, textureKey) {
    let p = this.players[data.uuid];

    if (!p) {
        p = this.physics.add.sprite(
            data.x,
            data.y,
            textureKey,
            0
        );

        this.players[data.uuid] = p;
    }

    p.targetX = data.x;
    p.targetY = data.y;

if (data.animation && this.anims.exists(data.animation)) {
    p.anims.play(data.animation, true);
}

}



    // =========================
    // ANIMATIONS
    // =========================
createAnimations(textureKey) {
    const anim = (name) => `${name}-${textureKey}`;

    if (this.anims.exists(anim('idle-down'))) return;

    this.anims.create({
        key: anim('idle-down'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [337, 336] }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: anim('walk-down'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [143, 144, 145, 146, 147, 148] }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: anim('idle-up'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [308, 309] }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: anim('walk-up'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [115, 116, 117, 118, 119, 120] }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: anim('idle-left'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [322, 323] }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: anim('walk-left'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [128, 129, 130, 131, 132, 134] }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: anim('idle-right'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [350, 351] }),
        frameRate: 6,
        repeat: -1
    });
    this.anims.create({
        key: anim('walk-right'),
        frames: this.anims.generateFrameNumbers(textureKey, { frames: [157, 158, 159, 160, 161, 162]}),
        frameRate: 10,
        repeat: -1
    });
}


    // =========================
    // UPDATE LOOP
    // =========================
    update(time) {
         if (!this.player) return;
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
    moving
        ? `walk-${this.lastDirection}-${this.spriteSheetKey}`
        : `idle-${this.lastDirection}-${this.spriteSheetKey}`,
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
                sprite_sheet: this.spriteSheetUrl,
                server_id:this.serverId
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
