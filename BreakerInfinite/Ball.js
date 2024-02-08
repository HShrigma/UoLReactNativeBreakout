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
    //pseudo normalizes value to the range of -1,1
    // BasicNToM11(value) {
    //     newVal = value;
    //     while (newVal > 1 || newVal < -1) {
    //         newVal /= 10;
    //     }
    //     return newVal;
    // }
    // SetDir(X, Y) {
    //     this.direction.x = X;
    //     this.direction.y = Y;
    // }
    // MultDir(X, Y) {
    //     if (this.direction.x * X > 1) {
    //         this.direction.x = 1;
    //     }
    //     else if (this.direction.x * X < -1) {
    //         this.direction.x = -1;
    //     }
    //     else{
    //         this.direction.x *= X;
    //     }

    //     if (this.direction.y * Y > 1) {
    //         this.direction.y = 1;
    //     }
    //     else if (this.direction.x * Y < -1) {
    //         this.direction.y = -1;
    //     }
    //     else{
    //         this.direction.y *= Y;
    //     }
    // }
    BuildRectColliderShapes(initColls) {
        var colls = [];

        initColls.forEach(shape => {
            //logic to get top,bottom,left,right edge of shapes
            collider = {
                tag: shape.tag,
                top: shape.obj.pos.y,
                bottom: shape.obj.pos.y + shape.obj.size.y,
                left: shape.obj.pos.x,
                right: shape.obj.pos.x + shape.obj.size.x
            }
            colls.push(collider);
        });
        return colls;
    }
    UpdateCollidersForObject(objWithTag) {

        for (let i = 0; i < this.colliders.length; i++) {
            if (this.colliders[i].tag == objWithTag.tag) {
                let toConvert = [objWithTag];
                let converted = this.BuildRectColliderShapes(toConvert)[0];
                this.colliders[i] = converted;
            }

        }

    }
    CheckBorders(coll) {
        //check if within collission 
        if (
            (this.pos.x <= coll.right && this.pos.x >= coll.left) &&
            (this.pos.y <= coll.bottom && this.pos.y >= coll.top)) {
            return {
                collides: true,
                collider: coll
            };
        }
        return { collides: false };
    }
    SimulatePhysics() {
        let collision = { collides: false };
        for (let i = 0; i < this.colliders.length; i++) {
            if (this.CheckBorders(this.colliders[i]).collides == true) {
                collision = this.CheckBorders(this.colliders[i]);
                break;
            }
        }
        if (collision.collides) {
            let posMiddleX = collision.collider.left + ((collision.collider.right - collision.collider.left) / 2);
            let posMiddleY = collision.collider.top + ((collision.collider.bottom - collision.collider.top) / 2);
            let anglediffX = this.pos.x - posMiddleX;
            let anglediffY = this.pos.y - posMiddleY;
            if (anglediffX > 0) {
                this.direction.x = 1;
            }
            else {
                this.direction.x = -1;
            }
            if (anglediffY > 0){
                this.direction.y = 1;
            }
            else{
                this.direction.y = -1;
            }
        }
        //logic for going out of screen
        if (this.pos.x <= this.screenbounds.left) {
            this.pos.x = this.screenbounds.left;
            this.direction.x *= -1;
        }
        if (this.pos.x >= this.screenbounds.right) {
            this.pos.x = this.screenbounds.right;
            this.direction.x *= -1;
        }

        if (this.pos.y <= this.screenbounds.top) {
            this.pos.y = this.screenbounds.top;
            this.direction.y *= -1;
        }
        if (this.pos.y >= this.screenbounds.bottom) {
            this.pos.y = this.screenbounds.bottom;
            this.direction.y *= -1;
        }
    }

    SetRandomUpDir() {
        //give random X dir -1/1
        let dirX = 1;
        if (Math.random() <= 0.5) {
            dirX *= -1;
        }
        this.direction = {
            x: dirX,
            y: -1
        }
    }
    GetNextPos() {
        this.Move();
        return this.pos;
    }
    Move() {
        this.SimulatePhysics();
        this.pos.x += this.speed * this.direction.x;
        this.pos.y += this.speed * this.direction.y;
    }

}