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
        this.AddNewRow(); //generate first row
    }

    GenRow() {
        row = [];
        for (let i = 0; i < this.cols; i++) {
            if (Math.random() <= this.randomCoeff) {
                let brickXY = {
                    x: (this.maxWH.w / this.cols) * i,
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
    //update sizeY of each brick in a Row
    UpdateColumnY(row, rowIndex){
        for (let i = 0; i < row.length; i++) {
            //if brick
            if (row[i] != "") {
                row[i].size.y = (this.maxWH.h / this.rows) * rowIndex;//set Y to = to rowHeight*currentRow
            }
        }
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
        if (this.bricks.length == 0) {
            this.bricks[0](this.GenRow());
        }
        else {
            //save bricks[0] to temp
            let temp = this.GenRow();
            for (let i = 0; i < this.bricks.length; i++) {
                //save current row with Updated Y params
                let current = this.UpdateColumnY(this.bricks[i],i+1);
                //set current row to temp
                bricks[i] = temp;
                //set temp to saved row
                temp = current;
            }
        }
    }
}