import { Brick } from "./Brick";
export class BrickMatrix {
    bricks;
    randomCoeff = 0.5;
    dims;
    rows;
    cols;
    brickSizeXY;
    constructor() {
        this.bricks = [];
    }
    Init(maxWH, brickSizeXY) {
        this.dims = maxWH;
        this.brickSizeXY = brickSizeXY;
        this.rows = Math.round(this.dims.h / this.brickSizeXY.y);
        this.cols = Math.round(this.dims.w / this.brickSizeXY.x);
    }
    GenRow() {
        let row = [];
        for (let i = 0; i < this.cols; i++) {
            if (Math.random() <= this.randomCoeff) {
                let brickXY = {
                    x: (this.dims.w / this.cols) * i,
                    y: 0
                }
                row.push(new Brick(this.brickSizeXY, brickXY))
            }
            else {
                row.push("");
            }
        }
        return row;
    }
    //update sizeY of each brick in a Row
    UpdateColumnY(row, rowIndex) {
        for (let i = 0; i < row.length; i++) {
            //if brick
            if (row[i] != "") {
                row[i].pos.y = (this.dims.h / this.rows) * rowIndex;//set Y to = to rowHeight*currentRow
            }
        }
        return row;
    }

    CanGenRow() {
        return this.bricks.length < this.rows;
    }

    AddNewRow() {
        //pushing empty array for both use cases
        //if no rows => bricks[0] is created
        //for all rows => empty array will be filled by bricks[len-1]
        this.bricks.push([]);
        //if first row
        if (this.bricks.length == 1) {
            this.bricks[0] = this.GenRow();
        }
        else {
            //save bricks[0] to temp
            let temp = this.GenRow();
            for (let i = 0; i < this.bricks.length; i++) {
                //save current row with Updated Y params
                let current = this.UpdateColumnY(this.bricks[i], i + 1);
                //set current row to temp
                this.bricks[i] = temp;
                //set temp to saved row
                temp = current;
            }
        }
    }
}