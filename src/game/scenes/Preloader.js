import { Scene } from 'phaser';
export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

     init ()
    {

        this.add.image(512, 384, 'background');

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {

            bar.width = 4 + (460 * progress);

        });
    }

     preload ()
    {
        const sheet = localStorage.getItem("sprite_sheet")
        this.load.setPath('assets');
         
        this.load.spritesheet('player', sheet, {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create ()
    {
        this.scene.start('PlayScene');
    }
}
