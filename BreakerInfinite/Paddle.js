export class Paddle {
    startPos;
    speed;
    size;
    minX;
    maxX;
    pos;
    //determines absolute size and position on first frame
    constructor(sizeXY, positionXY, speed, screenWidth) {
        this.startPos = {
            x: positionXY.x,
            y: positionXY.y
        }

        this.size = {
            x: sizeXY.x,
            y: sizeXY.y
        }
        this.pos = {
            x: this.startPos.x,
            y: this.startPos.y,
        }
        this.speed = speed;
        this.minX = 0;
        this.maxX = screenWidth - this.size.x;
    }
    //forces paddle X position in screen bounds,
    //called in onTouchHeldEvent
    keepInBounds() {
        if (this.pos.x < this.minX) {
            this.pos.x = this.minX;
        }
        if (this.pos.x > this.maxX) {
            this.pos.x = this.maxX;
        }
        console.log("keep In bounds played!");
    };

    onTouchHeldEvent(touchPosX) {
        //relative touchPos
        if(touchPosX < 0 ){
            this.pos.x -= this.speed;
        }
        if(touchPosX > 0){
            this.pos.x += this.speed;
        }
        //abs touchpos
        // if (this.pos.x < touchPosX)
        //     this.pos.x += this.speed;
        // if (this.pos.x > touchPosX)
        //     this.pos.x -= this.speed;
        this.keepInBounds();
        console.log('posX after: ' + this.pos.x);
    }
}
