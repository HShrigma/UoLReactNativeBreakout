export class Ball {
    size;
    pos;
    colliders;
    screenbounds;
    direction;
    speed;
    constructor(sizeXY, posXY, collidersArr, screenWH, speed) {
        this.size = sizeXY;
        this.pos = posXY;

        this.colliders = this.BuildRectColliderShapes(collidersArr);

        this.screenbounds = {
            top: 0,
            bottom: screenWH.h,
            left: 0,
            right: screenWH.w - this.size.x
        }

        this.direction = {
            x: 0.0,
            y: 0.0
        }

        this.speed = speed;
    }

    BuildRectColliderShapes(initColls) {
        var colls = [];

        initColls.forEach(shape => {
            //logic to get top,bottom,left,right edge of shapes
            collider = {
                top: shape.pos.y,
                bottom: shape.pos.y - shape.size.y,
                left: shape.pos.x,
                right: shape.pos.x - shape.size.x
            }
            colls.push(collider);
        });

        return colls;
    }
    CheckBorders(coll) {

    }
    SimulatePhysics() {
        this.CheckBorders(this.screenbounds);
    }

    SetRandomUpDir() {
        let dirX =  Math.random(); //give random X dir 0-1
        if (Math.random() <= 0.5) {
            dirX *= -1;
        } //give random cardinal direction - left or right
        // this.direction.x = 0;
        this.direction = {
            x: dirX,
            y: -1
        }
    }
    GetNextPos(){
        this.Move();
        return this.pos;
    }
    Move() {
        this.SimulatePhysics();
        this.pos.x += this.speed * this.direction.x;
        this.pos.y += this.speed * this.direction.y;
        //logic for going out of screen
        if (this.pos.x <= this.screenbounds.left) {
            this.pos.x = this.screenbounds.left;
            this.direction.x*=-1;
        }
        if (this.pos.x >= this.screenbounds.right) {
            this.pos.x = this.screenbounds.right;
            this.direction.x*=-1;
        }

        if (this.pos.y <= this.screenbounds.top) {
            this.pos.y = this.screenbounds.top;
            this.direction.y*=-1;
        }
        if (this.pos.y >= this.screenbounds.bottom) {
            this.pos.y = this.screenbounds.bottom;
            this.direction.y*=-1;
        }
    }
}