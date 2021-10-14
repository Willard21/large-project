

//storing height and width of the client’s browser
var window_height = window.innerHeight;
var window_width = window.innerWidth;
var playerSpeed = 240 // Pixels per second of both enemies and players

//since we’re using a phaser, we have to create a variable that holds the config data for the phaser.
var config = {
    
    type: Phaser.AUTO,
    width: 2000,
    height: 1000,


    //this object will hold configuration for arcade physics
    physics:
    {
        default: 'arcade',

        arcade:
        {
            debug: false,

            gravity:
            {
                y: 0,
            },
            
            //this means it will not cross 60
            fps: 60,
        }
    },

    scene:
    {
        //function where the statements and the comments will be executed pre initializing the game
        preload: preload,
        //create function works when the game is initialized only once at a time
        create: create,
        //main game loop that executes every CPU tick since we are modifying it upto 60 only
        update: update,
        
        //render: render,
    }
}

// holds a game instance
var game = new Phaser.Game(config);

var player;
var player_init = false;

function preload()
{
    // loading images
    this.load.image('player', 'public/img/player.png');
    this.load.image('bullet', 'public/img/bullet.png');
    this.load.image('enemy', 'public/img/enemy.png');
    this.load.image('background', 'public/img/background.jpg');
    this.load.image('target', 'public/img/target.png');
}

function create() {

    this.add.tileSprite(0, 0, 2000, 1000, 'background').setOrigin(0, 0);

    this.io = io(); //initializing a new io server
    let self = this; //because we have an event handler
    
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.io.on('actualPlayers', function(players)
    {
        for (let id in players)
        {
            //looping through the players
            if (id == self.io.id)
            {
                //we are in the array
                self.player_init = true;
                self.player = new Player(self, players[id].x, players[id].y);
            } else
            {
                // we are creating other players
                createEnemy(self, players[id]);
            }
        }
    });

    this.io.on('new_player', function (pInfo)
    {
        if (pInfo.player_id == self.io.id) {
            console.log("Don't add yourself as an enemy silly.")
            return // Don't add ourselves.
        }

        //we’re sending info about the new player from the server. So, we accept the info by pInfo
        createEnemy(self, pInfo);
    });

    //synchronizing enemy movement
    enemies_ref = this.enemies; //holds the reference to the enemy’s group

    this.io.on('enemy_moved', function(player_data)
    {
        enemies_ref.children.entries.forEach(function(enemy) {
            if (player_data.player_id == enemy.id) { //set a new position for the enemy because the player data and enemy id in the enemy’s group match together
                enemy.setAngle(player_data.angle);

                const angle = player_data.angle / 180 * Math.PI;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                enemy.setVelocity(vx * window.playerSpeed, vy * window.playerSpeed);

                let now = performance.now()
                if (!enemy.localCreatedTime) {
                    enemy.localCreatedTime = now // Local player's time
                    enemy.remoteCreatedTime = player_data.time  // Enemy player's time (different)
                    enemy.setPosition(player_data.x, player_data.y);
                } else {
                    const realTime = now - enemy.localCreatedTime
                    const enemyTime = player_data.time - enemy.remoteCreatedTime
                    let difference = realTime - enemyTime
                    if (difference < 0) {
                        // Ping has improved. Adjust to get closer to real-time.
                        enemy.remoteCreatedTime -= difference
                        console.log(difference, enemy.remoteCreatedTime - enemy.localCreatedTime)
                        difference = 0
                    }
                    
                    const distance = window.playerSpeed / 1000 * difference;
                    enemy.setPosition(player_data.x + vx * distance, player_data.y + vy * distance);
                }
                
            }
        });
    });
    
    // synchronizing shooting
    this.io.on('new_bullet', function(bullet_data)
    {
        new Shot(self.scene, bullet_data.x, bullet_data.y,
        bullet_data.angle);
    });
}
function update()
{
    if (this.player_init == true)
    {
        this.player.update();
    }
}

function createEnemy(scene, enemy_info)
{
    const enemy = new Enemy(scene, enemy_info.x, enemy_info.y, enemy_info.player_id);
    scene.enemies.add(enemy);
}

// function render () {
//     this.debug.cameraInfo(this.camera, 32, 32);
//     this.debug.spriteCoords(this.player, 32, 500);
// }
