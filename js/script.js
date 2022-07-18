let game = {
    tickNumber: 0,
    timer: null,
    score: 0,
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
    fruit: [
        {x: 1, y: 1}
    ],
    tick: function () {
        window.clearTimeout(game.timer);
        game.tickNumber++;
        if (game.tickNumber % 10 === 0) {
            game.addRandomFruit();
        }
        let result = snake.move();
        if (result === "Game Over") {
            alert("Game is over Score: " + game.score);
            return;
        }
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", 500);
    },
    addRandomFruit: function () {
        let randomY = Math.floor(Math.random() * game.board.length);
        let randomX = Math.floor(Math.random() * game.board[randomY].length);
        let randomLocation = {x: randomX, y: randomY};
        if (game.isEmpty(randomLocation) && !game.isFruit(randomLocation)) {
            game.fruit.push(randomLocation);
        }
    },
    isEmpty: function (location) {
        return game.board[location.y][location.x] === ' ';
    },
    isWall: function (location) {
        return game.board[location.y][location.x] === '#';
    },
    isFruit: function (location) {
        for (let fruitNumber = 0; fruitNumber < game.fruit.length; fruitNumber++) {
            let fruit = game.fruit[fruitNumber];
            if (location.x === fruit.x && location.y === fruit.y) {
                game.fruit.splice(fruitNumber, 1);
                return true;
            }
        }
        return false;
    },
    isSnake: function (location) {
        for (let snakePart = 0; snakePart < snake.parts.length; snakePart++) {
            let part = snake.parts[snakePart];
            if (location.x === part.x && location.y === part.y) {
                game.fruit.splice(snakePart, 1);
                return true;
            }
        }
        return false;
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
        if (game.isWall(location) || game.isSnake(location)) {
            return "Game Over";
        }
        if (game.isEmpty(location)) {
            snake.parts.unshift(location);
            snake.parts.pop();
        }
        if (game.isFruit(location)) {
            snake.parts.unshift(location);
            game.score++;
        }
    }
};

let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 75,
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

    draw: function (ctx, source, color) {
        source.forEach(function (part) {
            let partXLocation = part.x * graphics.squareSize;
            let partYLocation = part.y * graphics.squareSize;
            ctx.fillStyle = color;
            ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
        });
    },

    drawGame: function () {
        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.fruit, "red");
        graphics.draw(ctx, snake.parts, "green");
    }
};

let gameControl = {
    processInput: function (keyPressed) {
        let key = keyPressed.key.toLowerCase();
        let targetDirection = snake.facing;
        if (key === "w") targetDirection = "N";
        if (key === "a") targetDirection = "W";
        if (key === "s") targetDirection = "S";
        if (key === "d") targetDirection = "E";
        snake.facing = targetDirection;
        game.tick();
    },
    startGame: function () {
        window.addEventListener("keypress", gameControl.processInput, false);
        game.tick();
    }
};

gameControl.startGame();