export class Brick{
    size;
    pos;
    renders = true;
    constructor(sizeXY,posXY){
        this.size = sizeXY;
        this.pos = posXY;
    }

    OnHit(){
        //code to remove object
        this.renders = false;
    }
}