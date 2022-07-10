let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 50,
    drawBoard: function (ctx) {
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
    },

    drawSnake: function (ctx) {
        snake.parts.forEach(function drawPart(part) {
            let partXLocation = part.x * graphics.squareSize;
            let partYLocation = part.y * graphics.squareSize;
            ctx.fillStyle = "green";
            ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
        });
    },

    drawGame: function () {
        let ctx = graphics.canvas.getContext("2d");
        graphics.drawBoard(ctx);
        graphics.drawSnake(ctx);
    }
};

let game = {
    board: [
        "###############",
        "#             #",
        "#             #",
        "#             #",
        "#     ###     #",
        "#     ###     #",
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

graphics.drawGame();