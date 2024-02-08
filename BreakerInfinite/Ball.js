export class Ball{
    size;
    pos;
    colliders;
    screenbounds;
    direction;
    speed;
    constructor(sizeXY,posXY,collidersArr,screenWH, speed){
        this.size = sizeXY;
        this.pos = posXY;

        this.colliders = this.BuildRectColliderShapes(collidersArr);
        
        this.screenbounds = {
            minX: 0,
            maxX: screenWH.w,
            minY: 0,
            maxY: screenWH.h
        }
        
        this.direction = {
            x:0,
            y:0
        }
        
        this.speed = speed;
    }

    BuildRectColliderShapes(initColls)
    {
        var shapes = [];

        initColls.forEach(shape => {
            //logic to get top,bottom,left,right edge of shapes
            collider = {
                top: shape.pos.y,
                bottom: shape.pos.y + shape.size.y,
                left: shape.pos.x,
                right: shape.pos.x + shape.size.x
            }
            shapes.push(collider);
        });

        return shapes;
    }
    CheckBorders(shape){

    }
    SimulatePhysics(){
        this.CheckBorders(this.screenbounds);
    }

}