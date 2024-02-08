export class PhysicsEnv{
    
    paddle;
    ball;
    screen;
    bricks;

    constructor(paddle,ball,screenWH,bricks){
        this.paddle = paddle;
        this.ball = ball;
        this.screen = screenWH;
        this.bricks = bricks;
    }
}