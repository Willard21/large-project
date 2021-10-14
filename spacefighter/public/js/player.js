var fireRate = 100;
var nextFire = 0;

class Player extends Phaser.Physics.Arcade.Sprite {
    
    constructor (scene, x, y)
    {
        // super
        super(scene, x, y, "player");
        
        // render
        scene.add.existing(this);
        
        // physics rendering to move around and shoot with our players
        scene.physics.add.existing(this);
        this.depth = 5;
        
        // holds scene
        this.scene = scene;
        //this.setInteractive();
        this.setCollideWorldBounds(true); //to ensure that the player stays in the window

        //scene.bullets is a group
        scene.physics.add.collider(this, scene.bullets, function() {
            console.log("You’re dead");
        });

        this.setVelocity(window.playerSpeed, 0)

        // set the players to rotate towards the cursor
        scene.input.on("pointermove", function(pointer) {
            
            //convert the x and y axis from pointer to world axis
            const crosshairX = this.scene.input.mousePointer.x + this.scene.cameras.main.worldView.x;
            const crosshairY = this.scene.input.mousePointer.y + this.scene.cameras.main.worldView.y;
            this.angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.x, this.y, crosshairX, crosshairY);
            this.setAngle(this.angle);
            
            const transformedPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.scene.physics.moveToObject(this, transformedPoint, 240);
            this.sendUpdate()
        }, this);

        this.updateInterval = setInterval(() => this.sendUpdate(), 1000)
    }
    
    update() {

        // shoot with the player on click
        if(this.scene.input.activePointer.isDown)
        {  
            if (this.scene.time.now > nextFire)
            {
                // player method shoot
                nextFire = this.scene.time.now + fireRate;
                var x = this.x;
                var y = this.y;
                var angle = this.angle;
                this.scene.io.emit('new_bullet', {x: x, y: y, angle: angle}); //for synchronizing shooting
            }
        }

        this.scene.cameras.main.scrollX = this.x - window.innerWidth / 2;
        this.scene.cameras.main.scrollY = this.y -  window.innerHeight / 2;
    }

    sendUpdate() {
        // send socket to server
        this.scene.io.emit('player_moved', {x: this.x, y: this.y, angle: this.angle, time: performance.now()}); //the object contains the movement data
    }
}