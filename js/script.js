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
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.drawSnake(ctx);
    }
};

let game = {
    tickNumber: 0,
    timer: null,
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
    ],
    tick: function () {
        game.tickNumber++;
        snake.move();
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", 500);
    }
};

let snake = {
    parts: [
        {x: 4, y: 2},
        {x: 3, y: 2},
        {x: 2, y: 2}
    ],
    facing: "E",
    nextLocation: function () {
        let targetX = snake.parts[0].x;
        let targetY = snake.parts[0].y;
        targetY = snake.facing === "N" ? targetY - 1 : targetY;
        targetY = snake.facing === "S" ? targetY + 1 : targetY;
        targetX = snake.facing === "W" ? targetX - 1 : targetX;
        targetX = snake.facing === "E" ? targetX + 1 : targetX;
        return {x: targetX, y:targetY};
    },
    move: function () {
        let location = snake.nextLocation();
        snake.parts.unshift(location);
        snake.parts.pop();
    }
};

graphics.drawGame();

let gameControl = {
    startGame: function () {
        game.tick();
    }
};

gameControl.startGame();