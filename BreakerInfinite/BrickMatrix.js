import { Brick } from "./Brick";
export class BrickMatrix {
    bricks;
    randomCoeff = 0.5;
    dims;
    rows;
    cols;
    constructor(rows, cols, screenXY, maxWH, brickSizeXY) {
        this.bricks = [];
        this.dims = maxWH;
        this.rows = rows;
        this.cols = cols;
    }

    GenRow() {
        row = [];
        for (let i = 0; i < this.cols; i++) {
            if (Math.random() <= this.randomCoeff) {
                let brickXY = {
                    x: (screenWH.w / this.cols) * i,
                    y: 0
                }
                row.push(new Brick(brickSizeXY, brickXY))
            }
            else {
                row.push("");
            }
        }
        return row;
    }
    CanGenRow() {
        return this.bricks.length < this.rows;
    }
    AddNewRow() {
        //if first row
        if (this.bricks.length == 0) {
            this.bricks.push([]);
            this.bricks[0](this.GenRow());
        }
        //push GenRow
        else {
            //for every row
                //if row==0
                    //bricks[i] = row;

        }
    }
}