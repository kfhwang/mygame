var allWords=["棕","鴨","紳","臂","欠","WC","一","七","三","三十","九","二","二十","五 ","五","借","像","兄","八","八十","六","副","十","千","句","同","呂","四","四十","土","夕","女","姊","守","少","很","手","拳","方","日","果","民","男","百","萬","秀","科","童","筆","胡","菜","虎","蟲","資","錢","隻","難","零","飛機","高","龍"]

class Sudoku {
    //N=4 Size of the 2x2 Sudoku, N=9 for 3x3 
    //0<fillNum<NxN determin the game level (e.g., 6 for easy, 10 for medium)
    constructor(_N, fillNum) {
        this.N = _N;
        this.difficulty = fillNum;
        this.solvedBoard = [];
        this.puzzleBoard = [];
        this.block = [[], [], [], []];
        this.fourWords=[];
        this.generateSudokuPuzzle();
    }
    generateSudokuPuzzle = function () {
        allWords=allWords.sort((a,b)=>{return Math.random()-0.5});
        
        this.fourWords.push({"img":"drop","val":0,"r":-1,"c":-1});
        this.fourWords.push({"img":allWords[0], "val":1,"r":-1,"c":-1});
        this.fourWords.push({"img":allWords[1], "val":2,"r":-1,"c":-1});
        this.fourWords.push({"img":allWords[2], "val":3,"r":-1,"c":-1});
        this.fourWords.push({"img":allWords[3], "val":4,"r":-1,"c":-1});
        this.generateSolvedSudoku(); // Fill solvedBoard
        this.puzzleBoard = JSON.parse(JSON.stringify(this.solvedBoard)); // Create a copy
        let cellsToRemove = this.difficulty;

        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * this.N);
            const col = Math.floor(Math.random() * this.N);

            if (this.puzzleBoard[row][col] !== 0) {
                const tempValue = this.puzzleBoard[row][col];
                this.puzzleBoard[row][col] = 0; // Remove the number
                // Optional: Check for unique solution (more complex for a simple generator)

                // If the puzzle has multiple solutions after removing, you might want to put the number back.
                cellsToRemove--;
            }
        }
        for (var r = 0; r < this.puzzleBoard.length; r++) {
            for (var c = 0; c < this.puzzleBoard[0].length; c++) {
                var numBlock = Math.floor(r / 2) * 2 + (Math.floor(c / 2));
                var item=JSON.parse(JSON.stringify(this.fourWords[this.puzzleBoard[r][c]]));
                item.r=r; 
                item.c=c;
                this.block[numBlock].push(item);
            }
        }
        // done [solvedBoard, puzzleBoard];
    }

    generateSolvedSudoku = function () {
        // Initialize an empty 4x4 board
        const initialBoard = Array(this.N).fill(0).map(() => Array(this.N).fill(0));
        // Object.assign(this.solvedBoard, initialBoard); // Copy to the passed board
        this.solvedBoard = JSON.parse(JSON.stringify(initialBoard));
        this.solve();
    }

    CheckAnswer = function (answer) {
        if(answer==undefined)
            answer=this.puzzleBoard;
        if (JSON.stringify(this.solvedBoard) == JSON.stringify(answer))
            return [true];
        else if(this.findEmpty(answer))
            return [false];
        else { //if there is anothre solution
            for (let row = 0; row < answer.length; row++) {
                for (let col = 0; col < answer[0].length; col++) {
                    if (!this.isValid(answer, answer[row][col], [row, col]))
                        
                    return [false,[row,col]];
                }
            }
            return [true];
        }
    }
}
//invalid row,col,block
Sudoku.prototype.invalidRCB=function(board,pos){
    if(board==undefined)
        board=this.puzzleBoard;
    const [row, col] = pos;
    const num=board[row][col];

    // Check 2x2 box
    const _row_col = Math.sqrt(this.N);
    const boxRow = Math.floor(row / _row_col);
    const boxCol = Math.floor(col / _row_col);
    for (let r = boxRow * _row_col; r < boxRow * _row_col + _row_col; r++) {
        for (let c = boxCol * _row_col; c < boxCol * _row_col + _row_col; c++) {
            if (board[r][c] === num && (r !== row || c !== col)) {
                return [r,c];
            }
        }
    }

    // Check col
    for (let c = 0; c < this.N; c++) {
        if (board[row][c] === num && col !== c) {
            return [row,c];
        }
    }

    // Check row
    for (let r = 0; r < this.N; r++) {
        if (board[r][col] === num && row !== r) {
            return [r,col];
        }
    }

    
}
//
Sudoku.prototype.findEmpty = function (board) {
     if(board==undefined)
        board=this.puzzleBoard;
    for (let r = 0; r < this.N; r++) {
        for (let c = 0; c < this.N; c++) {
            if (board[r][c] === 0) { // 0 represents an empty cell
                return [r, c];
            }
        }
    }
    return null; // No empty cells
}
Sudoku.prototype.isValid = function (board, num, pos) {
    const [row, col] = pos;

    // Check col
    for (let c = 0; c < this.N; c++) {
        if (board[row][c] === num && col !== c) {
            return false;
        }
    }

    // Check row
    for (let r = 0; r < this.N; r++) {
        if (board[r][col] === num && row !== r) {
            return false;
        }
    }

    // Check 2x2 box
    const _row_col = Math.sqrt(this.N);
    const boxRow = Math.floor(row / _row_col);
    const boxCol = Math.floor(col / _row_col);
    for (let r = boxRow * _row_col; r < boxRow * _row_col + _row_col; r++) {
        for (let c = boxCol * _row_col; c < boxCol * _row_col + _row_col; c++) {
            if (board[r][c] === num && (r !== row || c !== col)) {
                return false;
            }
        }
    }
    return true;
}
Sudoku.prototype.solve = function () {
    const emptyPos = this.findEmpty(this.solvedBoard);
    if (!emptyPos) {
        return true; // Board is full and solved
    }

    const [row, col] = emptyPos;
    const numbers = []; // Possible numbers for 2x2 Sudoku
    for (let i = 0; i < this.N; i++) {
        numbers.push(i + 1);
    }
    numbers.sort(() => Math.random() - 0.5); // Randomize for varied puzzles

    for (const num of numbers) {
        if (this.isValid(this.solvedBoard, num, [row, col])) {
            this.solvedBoard[row][col] = num;
            if (this.solve()) {
                return true;
            }
            this.solvedBoard[row][col] = 0; // Backtrack
        }
    }
    return false;
}



// Example usage:
// const newGame = new Sudoku(4, 6); // Generate an 2x2 Sudoku with diffcult value 6/(4x4)
// console.log(newGame.puzzleBoard);
// console.log(newGame.block);
// console.log(newGame.CheckAnswer(newGame.puzzleBoard));
// var Candidate=[
//                     new Array(5).fill(newGame.fourWords[1]),
//                     new Array(5).fill(newGame.fourWords[2]),
//                     new Array(5).fill(newGame.fourWords[3]),
//                     new Array(5).fill(newGame.fourWords[4]),
// ] 
