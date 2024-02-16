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
        this.bricks = this.BuildMatrix();
    }
    BuildMatrix() {
        matr = [];
        for (let i = 0; i < this.rows; i++) {
            matr.push(this.GenRandomRow(i));
            matr[i].forEach(col => { col.renders = false; });
        }
        return matr;
    }
    GenRandomRow(rowIndex = 0) {
        let row = [];
        for (let i = 0; i < this.cols; i++) {
            let brickXY = {
                x: (this.dims.w / this.cols) * i,
                y: (this.dims.h / this.rows) * rowIndex
            }
            row.push(new Brick(this.brickSizeXY, brickXY));
            if (Math.random() > this.randomCoeff) {
                row[i].renders = false;
            }
        }
        return row;
    }
    //Get array of render values (t/f) from row
    SaveRenders(row){
        renderValues = [];
        try{
            row.forEach(brick => {
                renderValues.push(brick.renders);
            });
            return renderValues;
        }
        catch(err){
            console.error("unexpected row error:" + err + "\nRow:" + row);
        }

    }
    //update a row's render Values based on the last one
    UpdateRowRenderValue(renderValues, toRow) {
        for (let i = 0; i < toRow.length; i++) {
            toRow[i].renders = renderValues[i];
        }
        return toRow;
    }

    CanGenRow() {
        let lastRowNoRender = true;
        for (let i = 0; i < this.bricks[this.bricks.length-1].length; i++) {
            if (this.bricks[this.bricks.length-1][i].renders){
                lastRowNoRender = false;
                break;
            }   
        }
        return lastRowNoRender;
    }
    LogTruthTable() {
        for (let i = 0; i < this.bricks.length; i++) {
            let logStr = "";
            for (let j = 0; j < this.bricks[i].length; j++) {
                logStr += "[" + i + "]" + "[" + j + "]: " + this.bricks[i][j].renders + " " + this.bricks[i][j].pos.y + " ";
            }
            console.log(logStr);
        }
    }
    AddNewRow() {
        //rows updated only by render values
        let temp = this.SaveRenders(this.GenRandomRow());
        let ind = 0;
        for (let i = 0; i < this.bricks.length; i++) {
            //save current row render values
            let current = this.SaveRenders(this.bricks[i]); //current render values
            //set current row  renders to temp
            this.bricks[i] = this.UpdateRowRenderValue(temp, this.bricks[i]);
            //set temp renders to saved row
            temp = current;
        }
    }
}