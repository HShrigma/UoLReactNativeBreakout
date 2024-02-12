export class Ball {
    //#region Own Stats
    size;
    pos;
    direction;
    speed;
    //#endregion

    //#region Colliders
    paddleColl;
    brickColls;
    screenbounds;
    //#endregion

    constructor(sizeXY, posXY, collidersArr, screenWH, speed, paddle) {
        //Own Stats
        this.size = sizeXY;
        this.pos = posXY;

        this.direction = {
            x: 0.0,
            y: 0.0
        }

        this.speed = speed;

        //Colliders
        this.paddleColl = this.BuildRectCollider(paddle);
        this.brickColls = this.BuildRectColliderShapesArr(collidersArr);

        this.screenbounds = {
            top: 0,
            bottom: screenWH.h,
            left: 0,
            right: screenWH.w - this.size.x
        }
    }
    //pseudo normalizes value to the range of -1,1
    // BasicNToM11(value) {
    //     newVal = value;
    //     while (newVal > 1 || newVal < -1) {
    //         newVal /= 10;
    //     }
    //     return newVal;
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
    //#region Colliders: Build & Update
    BuildRectCollider(shape) {
        return {
            top: shape.pos.y,
            bottom: shape.pos.y + shape.size.y,
            left: shape.pos.x,
            right: shape.pos.x + shape.size.x
        };
    }

    BuildRectColliderShapesArr(initColls) {
        var colls = [];
        if (initColls.length != 0) {
            for (let i = 0; i < initColls.length; i++) {
                collider = this.BuildRectCollider(initColls[i]);
                colls.push(collider);
            }
        }

        return colls;
    }

    UpdatePaddleCollider(paddle) {
        this.paddleColl = this.BuildRectCollider(paddle);
    }

    UpdateBrickColliders(bricksMatrix) {
        this.brickColls = this.BuildRectColliderShapesArr(bricksMatrix);
    }
    //#endregion

    SetDir(anglediffs) {
        if (anglediffs.x > 0) {
            this.direction.x = 1;
        }
        //if ball to the left of collision
        else {
            this.direction.x = -1;
        }
        //if ball to the bottom of collision
        if (anglediffs.y > 0) {
            this.direction.y = 1;
        }
        //if ball to the top of collision
        else {
            this.direction.y = -1;
        }
    }
    SetDisplacement(collision) {

        let diffLeft = this.pos.x - collision.collider.left;
        let diffRight = collision.collider.right - (this.pos.x + this.size.x);

        let diffTop = this.pos.y - collision.collider.top;
        let diffBot = collision.collider.bottom - (this.pos.y + this.size.y);
        console.log("diffLeft: " + diffLeft);
        console.log("diffRight: " + diffRight);
        console.log("diffTop: " + diffTop);
        console.log("diffBot: " + diffBot);

        let diffArr = [diffTop,diffBot,diffLeft,diffRight];
        lowest = diffArr[0];
        for (let i = 0; i < diffArr.length; i++) {
            if(diffArr[i] < lowest){
                lowest = diffArr[i];
            }
            
        }
        //if ball is closer to bottom
        if (diffBot == lowest) {
            this.pos.y = collision.collider.bottom;
            console.log("Displace below collision");
        }
        //if ball is closer to top
        if (diffTop == lowest) {
            this.pos.y = collision.collider.top - this.size.y;
            console.log("Displace above collision");
        }
        //if ball is closer to left
        if (diffLeft == lowest) {
            this.pos.x = collision.collider.left - this.size.x;
            console.log("Displace left of collision");
        }
        //if ball is closer to right
        if (diffRight == lowest) {
            this.pos.x = collision.collider.right;
            console.log("Displace right of collision");
        }
    }
    OnCollision(collision) {

        let posMiddleX = collision.collider.left + ((collision.collider.right - collision.collider.left) / 2);
        let posMiddleY = collision.collider.top + ((collision.collider.bottom - collision.collider.top) / 2);
        let anglediffs =
        {
            x: this.pos.x - posMiddleX,
            y: this.pos.y - posMiddleY
        };
        // let anglediffX = this.pos.x - posMiddleX;
        // let anglediffY = this.pos.y - posMiddleY;
        //if ball to the right of collision
        this.SetDir(anglediffs);
        this.SetDisplacement(collision);

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
    CheckPaddleCollision() {
        let collision = { collides: false };
        if (this.CheckBorders(this.paddleColl).collides == true) {
            collision = this.CheckBorders(this.paddleColl);
            this.OnCollision(collision);
        }
    }

    CheckAllBorders() {
        let collision = { collides: false };
        for (let i = 0; i < this.brickColls.length; i++) {
            if (this.CheckBorders(this.brickColls[i]).collides == true) {
                collision = this.CheckBorders(this.brickColls[i]);
                this.OnCollision(collision);
                break;
            }
        }
    }

    //logic for going out of screen
    KeepInScreen() {
        if (this.pos.x <= this.screenbounds.left) {
            this.pos.x = this.screenbounds.left;
            this.direction.x *= -1;
            //add displacement
        }
        if (this.pos.x >= this.screenbounds.right) {
            this.pos.x = this.screenbounds.right;
            this.direction.x *= -1;
            //add displacement
        }

        if (this.pos.y <= this.screenbounds.top) {
            this.pos.y = this.screenbounds.top;
            this.direction.y *= -1;
            //add displacement
        }
        if (this.pos.y >= this.screenbounds.bottom) {
            this.pos.y = this.screenbounds.bottom;
            this.direction.y *= -1;
            //add displacement
        }
    }

    SimulatePhysics() {
        //check possible collision with bricks
        this.CheckAllBorders();
        //check collision with paddle
        this.CheckPaddleCollision();
        //check if out of screen bounds
        this.KeepInScreen();
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
        //move to position
        this.pos.x += this.speed * this.direction.x;
        this.pos.y += this.speed * this.direction.y;
        //change position if it collides with any
        this.SimulatePhysics();
    }

}