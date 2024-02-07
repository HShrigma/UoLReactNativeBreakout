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

    };

    onTouchHeldEvent(touchPosX) {

        if (touchPosX < this.pos.x) {
            this.pos.x -= this.speed;
        }

        if (touchPosX > this.pos.x) {
            this.pos.x += this.speed;
        }
        this.keepInBounds();
    }
}
