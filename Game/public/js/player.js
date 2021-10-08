class Player extends Phaser.Physics.Arcade.Sprite {
    
    constructor (scene, x, y) {
    // super
    super(scene, x, y, "player");
    
    // render
    scene.add.existing(this);
    
    // physics rendering to move around and shoot with our players
    scene.physics.add.existing(this);
    this.player_speed = 600;
    this.depth = 5;
    
    // holds scene
    this.scene = scene;
    this.setInteractive();
    this.setCollideWorldBounds(true); //to ensure that the player stays in the window
    self = this;
    
    // input handlers
    this.keyUp = scene.input.keyboard.addKey('W');
    this.keyDown = scene.input.keyboard.addKey('S');
    this.keyLeft = scene.input.keyboard.addKey('A');
    this.keyRight = scene.input.keyboard.addKey('D');
    
    //scene.bullets is a group
    scene.physics.add.collider(this, scene.bullets, function() {
        alert("You’re dead");
    });
    
    // set the players to rotate towards the cursor
    scene.input.on("pointermove", function(pointer) {
    
        //convert the x and y axis from pointer to world axis
    this.angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);
        this.setAngle(this.angle);
    }, this);
    
    //shoot with the player on pressing F
    scene.input.keyboard.on('keydown-F', function() {
    
    // player method shoot
    var x = self.x;
    var y = self.y;
    var angle = self.angle;
    self.scene.io.emit('new_bullet', {x: x, y: y, angle: angle}); //for synchronizing shooting
    });
    this.old_x = this.x;
    this.old_y = this.y;
    this.old_angle = this.angle;
    }
    
    update() {
    
    this.setVelocity(0, 0); //with every CPU tick, reset velocity to 0 since we don’t want it to forever move upwards or downwards
    
    if (this.keyUp.isDown) {
        this.setVelocityY(this.player_speed * -1);
    }else if(this.keyDown.isDown){
        this.setVelocityY(this.player_speed);
    }

    if (this.keyRight.isDown) {
        this.setVelocityX(this.player_speed);
    }else if(this.keyLeft.isDown){
        this.setVelocityX(this.player_speed * -1);
    }

    //synchronizing enemy movement
    var x = this.x;
    var y = this.y;
    var angle = this.angle;

    if (x != this.old_x || y != this.old_y || angle != this.old_angle) { //this if statement exists only when the player moves
        
        // send socket to server
        this.scene.io.emit('player_moved', {x: x, y: y, angle: angle}); //the object contains the movement data
        
        //assigning new movement data after the player has moved
        this.old_x = x;
        this.old_y = y;
        this.old_angle = angle;
    }
}
}