import {Client} from "./client.js"
import eventsCenter from "./eventsCenter.js";
import {StateMachine} from "./StateMachine.js";
import {State} from "./StateMachine.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image('ground', '/resources/images/ground.png');
        this.load.image('background', '/resources/images/Background.png');
        this.load.image('platform01', '/resources/images/platform01.png');
        this.load.spritesheet('player', '/resources/images/warriorPlayer.png', {frameWidth: 69, frameHeight: 44});
    }

    create() {
        this.player = {myself: '', enemy: ''};
        this.platforms = this.physics.add.staticGroup();

        this.add.image(400, 300, 'background');
        this.platforms.create(400, 587.5, 'ground');

        Client.askNewPlayer();
        eventsCenter.on('addPlayer', this.addPlayer, this);
        eventsCenter.on('addOtherPlayer', this.addOtherPlayer, this);
        // eventsCenter.on('joinPlayer', this.addOtherPlayer, this);
        eventsCenter.on('destroyDisconnectedSprite', this.destroyDisconnectedSprite, this);


        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {start: 6, end: 11}),
            frameRate: 10,
            repeat: -1

        })
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {start: 6, end: 11}),
            frameRate: 10,
            repeat: -1,
        })
    } // create
    addPlayer(data) {
        this.player.myself = this.physics.add.sprite(data['x'], data['y'], 'player');
        this.physics.add.collider(this.player.myself, this.platforms);
        this.player.myself.me = 'true';
        this.stateMachine = new StateMachine(
            'idle',
            {
                idle: new IdleState(),
                move: new MoveState()
            },
            [this, this.player.myself]
        );
    }

    addOtherPlayer(data) {
        this.player.enemy = this.physics.add.sprite(data['x'], data['y'], 'player');
        this.physics.add.collider(this.player.enemy, this.platforms);
        this.player.enemy.stateAction = '';
        this.stateMachineEnemy = new StateMachine(
            'idle',
            {
                idle: new IdleState(),
                move: new MoveState()
            },
            [this, this.player.enemy]
        );
    }

    destroyDisconnectedSprite(){
        console.log('hello')
    }

    update() {

        if(this.stateMachine){
            this.stateMachine.step();
        }
        if(this.stateMachineEnemy){
            this.stateMachineEnemy.step();
        }

        this.cursors = this.input.keyboard.createCursorKeys();

        // eventsCenter.on('moveEnemy', moveEnemy, this);
        // function drawJoinedPlayer(data){
        //     this.player.enemy = this.physics.add.sprite(data['x'], data['y'],'player');
        //     this.physics.add.collider(this.player.enemy, this.platforms);
        // }

        // if(this.player.enemy === ''){
        //     console.log('No enemy yet');
        // }
        // else{
        //     this.enemyStateMachine.step()
        // }

    }// update
}

class IdleState extends State{

    enter(scene, player){
        player.anims.play('idle', true);
        player.setVelocityX(0);
    }

    execute(scene, player){
        if(scene.cursors.left.isDown){
            player.moveDirection = 'left';
            this.stateMachine.transition('move');
        }
        else if(scene.cursors.right.isDown){
            player.moveDirection = 'right';
            this.stateMachine.transition('move');
        }
        else {
            player.moveDirection = 'idle';
        }
    }

}

class MoveState extends State {execute(scene, player) {
    if(player.me){
        switch (player.moveDirection) {
            case 'idle':
                this.stateMachine.transition('idle');
                // player.stateAction = 'idle';
                break;
            case 'left':
                player.setVelocityX(-160);
                player.anims.play('left', true);
                player.flipX = true;
                Client.playerMovement('left');
                break;
            case 'right':
                player.setVelocityX(160);
                player.anims.play('right', true);
                player.flipX = false;
                break;
        }

        if (scene.cursors.left.isDown) {
            player.moveDirection = 'left';
        }
        else if (scene.cursors.right.isDown) {
            player.moveDirection = 'right';
        }
        else {
            player.moveDirection = 'idle';
        }
    }
    else {// Other player online
        switch (eventsCenter.on('moveEnemy', this.addPlayer, this)) {
            case 'idle':
                this.stateMachine.transition('idle');
                // player.stateAction = 'idle';
                break;
            case 'left':
                player.setVelocityX(-160);
                player.anims.play('left', true);
                player.flipX = true;
                Client.playerMovement('left');
                break;
            case 'right':
                player.setVelocityX(160);
                player.anims.play('right', true);
                player.flipX = false;
                break;
        }
    }

}

}





// TODO: Make a state machine:
// More character movement





