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
    difficultyMultiplier = 1.005;
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
    GetPosCollDiffs(collision) {

        let diffLeft = this.pos.x - collision.collider.left;
        let diffRight = collision.collider.right - (this.pos.x + this.size.x);

        let diffTop = this.pos.y - collision.collider.top;
        let diffBot = collision.collider.bottom - (this.pos.y + this.size.y);

        let diffArr = [diffTop, diffBot, diffLeft, diffRight];
        lowest = diffArr[0];

        for (let i = 0; i < diffArr.length; i++) {
            if (diffArr[i] < lowest) {
                lowest = diffArr[i];
            }

        }
        return { lowest: lowest, left: diffLeft, right: diffRight, top: diffTop, bot: diffBot }
    }
    SetDir(collision, diffs) {
        //if ball is closer to bottom
        if (diffs.bot == diffs.lowest || diffs.top == diffs.lowest) {
            this.direction.y *= -1;
        }
        //if ball is closer to left
        if (diffs.left == diffs.lowest || diffs.right == diffs.lowest) {
            this.direction.x *= -1;
        }
    }
    SetDisplacement(collision, diffs) {
        //if ball is closer to bottom
        if (diffs.bot == diffs.lowest) {
            this.pos.y = collision.collider.bottom;
        }
        //if ball is closer to top
        if (diffs.top == diffs.lowest) {
            this.pos.y = collision.collider.top - this.size.y;
        }
        //if ball is closer to left
        if (diffs.left == diffs.lowest) {
            this.pos.x = collision.collider.left - this.size.x;
        }
        //if ball is closer to right
        if (diffs.right == diffs.lowest) {
            this.pos.x = collision.collider.right;
        }
    }
    OnCollisionEnter(collision) {
        this.speed *= this.difficultyMultiplier;
        let diffs = this.GetPosCollDiffs(collision);
        this.SetDir(collision, diffs);
        this.SetDisplacement(collision, diffs);
    }

    CheckBorders(coll) {
        //check if within collission 
        if (
            (this.pos.x <= coll.right && this.pos.x + this.size.x >= coll.left) &&
            (this.pos.y <= coll.bottom && this.pos.y + this.size.y >= coll.top)) {
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
            this.OnCollisionEnter(collision);
        }
    }
    //Displace & reverse direction based on collision with screen bounds if collision is there
    CheckBricksCollision() {
        let collision = { collides: false };
        for (let i = 0; i < this.brickColls.length; i++) {
            if (this.CheckBorders(this.brickColls[i]).collides == true) {
                collision = this.CheckBorders(this.brickColls[i]);
                this.OnCollisionEnter(collision);
                break;
            }
        }
    }

    //Displace & reverse direction based on collision with screen bounds if collision is there
    KeepInScreen() {
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
    //simulates interaction with all physics entities
    SimulatePhysics() {
        //check possible collision with bricks
        this.CheckBricksCollision();
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

    Move() {
        //move to position
        let magnitude = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        this.pos.x += magnitude * this.speed * this.direction.x;
        this.pos.y += magnitude * this.speed * this.direction.y;
        //change position & direction if it collides with anything
        this.SimulatePhysics();
    }

}