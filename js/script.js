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
        window.clearTimeout(game.timer);
        game.tickNumber++;
        snake.move();
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", 500);
    },
    isEmpty: function (location) {
        return game.board[location.y][location.x] === ' ';
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
        if (game.isEmpty(location)) {
            snake.parts.unshift(location);
            snake.parts.pop();
        }
    }
};

let gameControl = {
    processInput: function (keyPressed) {
        let key = keyPressed.key.toLowerCase();
        let targetDirection = snake.facing;
        if (key === "w") {
            targetDirection = "N";
        }
        if (key === "a") {
            targetDirection = "W";
        }
        if (key === "s") {
            targetDirection = "S";
        }
        if (key === "d") {
            targetDirection = "E";
        }
        if (key === "/") {
            window.clearTimeout(game.timer);
        }
        snake.facing = targetDirection;
        game.tick();
    },
    startGame: function () {
        window.addEventListener("keypress", gameControl.processInput, false);
        game.tick();
    }
};

graphics.drawGame();
gameControl.startGame();