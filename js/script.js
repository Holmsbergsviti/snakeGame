let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 30,
    drawBoard: function () {
        let ctx = graphics.canvas.getContext("2d");
        let currentYoffset = 0;
        game.board.forEach(function chekLine(line) {
        line = line.split('');
        let currentXoffset = 0;
        line.forEach(function chekCharacter(character) {
            if (character === '#') {
                ctx.fillStyle = "black";
                ctx.fillRect(currentXoffset, currentYoffset, graphics.squareSize, graphics.squareSize);
            }
            currentXoffset += graphics.squareSize;
        });
            currentYoffset += graphics.squareSize;
        });
    }
};

let game = {
    board: [
        "###############",
        "#             #",
        "#             #",
        "#             #",
        "#     ####    #",
        "#     ####    #",
        "#             #",
        "#             #",
        "#             #",
        "###############",
    ]
};

let snake = {
    parts: [
        {x: 4, y: 2},
        {x: 3, y: 2},
        {x: 2, y: 2}
    ],
    facing: "E"
};

graphics.drawBoard();