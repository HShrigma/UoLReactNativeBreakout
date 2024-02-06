export class Paddle {
    startPos;
    speed;
    size;
    minX;
    maxX;
    currentPos;
    //determines absolute size and position on first frame
    constructor(sizeXY, positionXY, speed, screenWidth) {
        this.startPos = {
            x: positionXY.x,
            y: positionXY.y
        }


        this.minX = 0;
        this.maxX = screenWidth;

        this.size = {
            x: sizeXY.x,
            y: sizeXY.y
        }
        this.currentPos = {
            x: this.startPos.x,
            y: this.startPos.y,
        }
        this.speed = speed;
    }
    //forces paddle X position in screen bounds,
    //called in onTouchHeldEvent
    keepInBounds() {
        if (this.currentPos.x < this.minX) {
            this.currentPos.x = this.minX;
        }
        if (this.currentPos.x > this.maxX) {
            this.currentPos.x = this.maxX;
        }
    };

    onTouchHeldEvent(touchPosX) {

        if (touchPosX < this.currentPos.x) {
            this.currentPos.x -= this.speed;
        }

        if (touchPosX > this.currentPos.x) {
            this.currentPos.x += this.speed;
        }
        this.keepInBounds();
    }
}
