class Enemy extends Phaser.Physics.Arcade.Sprite {
    
    constructor (scene, x, y, id) {
        
        // super
        super(scene, x, y, "enemy");
        
        // render
        scene.add.existing(this);
        
        // physics rendering
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.depth = 5;
        this.id = id;
        this.scene = scene
    }
    
    shoot() {
        //this function will initialize a shooting from the player. It will spawn a bullet and send it somewhere
        new Shot(this.scene, this.x, this.y, this.angle);
    }
}