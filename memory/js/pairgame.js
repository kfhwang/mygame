
class Pair extends EventTarget {
    //Easy N=8 4*2, Mid N=16 8*2, Hard N=32 16*2
    constructor(level) {
        super();
        this.words = [];
        this.difficulty = level;
        this.board = []
        this.loadWords();
    }
    loadWords = async function () {
        try {
            const response = await fetch('./words.json'); // Path to your file
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.words = await response.json(); // Automatically parses string to object
            console.log(this.words);
            this.generatePair()
        } catch (error) {
            console.error("Could not load JSON file:");
        }
    }
    generatePair = function () {
        let candWords;
        switch (this.difficulty) {
            case "easy":
                candWords = this.words.filter(item => { return item.bookid == 30 });
                candWords = candWords.sort((a, b) => { return Math.random() - 0.5 });
                for (let index = 0; index < 4; index++) {
                    this.board.push({ "ani": candWords[index].ename + ".png", frames: candWords[index].width / 128 - 1, width:candWords[index].width, height: candWords[index].height, wordName: candWords[index].name, done:false })
                }
                this.board = this.board.concat(JSON.parse(JSON.stringify(this.board))).sort((a, b) => { return Math.random() - 0.5 });
                break;
            case "mid":
                candWords = this.words.filter(item => { return item.bookid == 12 });
                candWords = candWords.sort((a, b) => { return Math.random() - 0.5 });
                for (let index = 0; index < 8; index++) {
                    this.board.push({ "ani": candWords[index].ename + ".png", frames: candWords[index].width / 128 - 1, width:candWords[index].width, height: candWords[index].height, wordName: candWords[index].name, done:false })
                }
                this.board = this.board.concat(JSON.parse(JSON.stringify(this.board))).sort((a, b) => { return Math.random() - 0.5 });
                break;
            case "hard":
                candWords = this.words.filter(item => { return item.bookid == 14 ||  item.bookid==38 });
                candWords = candWords.sort((a, b) => { return Math.random() - 0.5 });
                for (let index = 0; index < 16; index++) {
                    this.board.push({ "ani": candWords[index].ename + ".png", frames: candWords[index].width / 128 - 1, width:candWords[index].width, height: candWords[index].height, wordName: candWords[index].name, done:false })
                }
                this.board = this.board.concat(JSON.parse(JSON.stringify(this.board))).sort((a, b) => { return Math.random() - 0.5 });
                
                break;
            default:
                
                break;
        }
        const event=new CustomEvent("pairready",{detail:{boardSize:this.board.length}});
        this.dispatchEvent(event);

    }
    checkAnswer = function (p1, p2) {
        return (this.board[p1].wordName == this.board[p2].wordName);
    }

}
