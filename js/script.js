let game = {
    newFacing: 0,
    timer: null,
    tickNumber: 0,
    minutes: 0,
    seconds: 0,
    score: 0,
    board: [
        "##########################",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "#                        #",
        "##########################"
    ],
    fruit: [
        {x: 9, y: 2}
    ],
    tick: function () {
        window.clearTimeout(game.timer);
        game.tickNumber++;
        if (game.tickNumber % 15 === 0) {
            game.addRandomFruit();
        }
        if (game.tickNumber % 5 === 0) gameControl.gameTime();
        let result = snake.move();
        if (result === "Game Over") {
            alert("Game is over Score: " + game.score);
            if (confirm("Do you want to play again?") === true) {
                gameControl.restartGame();
                gameControl.startGame();
                return;
            }
            return;
        }
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", 200);
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
        if (gameControl.newFacing.length !== game.newFacing) {
            let newFacingIs = gameControl.newFacing[game.newFacing];
            gameControl.processInput(newFacingIs);
            game.newFacing++;
        }
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
            document.getElementById("score").innerHTML = "Score: " + game.score;
        }
    }
};

let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 20,
    squareColor: 0,
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
                graphics.squareColor++;
            });
            currentYoffset += graphics.squareSize;
            graphics.squareColor = 1;
        });
        graphics.squareColor = 0;
    },
    countDraw: 0,
    draw: function (ctx, source, color) {
        source.forEach(function (part) {
            graphics.countDraw++;
            let partXLocation = part.x * graphics.squareSize;
            let partYLocation = part.y * graphics.squareSize;
            if (graphics.countDraw === 1 && color === "green") {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
        })
        graphics.countDraw = 0;
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
    newFacing: [],
    gameTime: function () {
        game.seconds++;
      if (game.seconds === 60) {
          game.minutes++;
          game.seconds = 0;
      }
      if (game.seconds < 10) {
          if (game.minutes < 10){
              document.getElementById("timer").innerHTML = "Time: 0" + game.minutes + ":0" + game.seconds;
          } else {
              document.getElementById("timer").innerHTML = "Time: " + game.minutes + ":0" + game.seconds;
          }
      } else {
          if (game.minutes < 10){
              document.getElementById("timer").innerHTML = "Time: 0" + game.minutes + ":" + game.seconds;
          } else {
              document.getElementById("timer").innerHTML = "Time: " + game.minutes + ":" + game.seconds;
          }
      }
    },
    input: function (keyPressed) {
        let key = keyPressed.key.toLowerCase();
        gameControl.newFacing = gameControl.newFacing + key;
    },
    processInput: function (key) {
        if (key === "w")
            if (snake.facing !== "S" && snake.facing !== "N"){
                gameControl.changeDirectionWASD("N");
            }
        if (key === "a")
            if (snake.facing !== "E" && snake.facing !== "W") {
                gameControl.changeDirectionWASD("W");
            }
        if (key === "s")
            if (snake.facing !== "N" && snake.facing !== "S") {
                gameControl.changeDirectionWASD("S");
            }
        if (key === "d")
            if (snake.facing !== "W" && snake.facing !== "E") {
                gameControl.changeDirectionWASD("E");
            }
    },
    startGame: function () {
        alert("This is a Snake Game from Vlad Salii. \nFruit is red. Snake is green. \nTask is to eat fruits. \nControl - WASD: \n" +
            "   • W - Up. \n   • A - left. \n   • S - down. \n   • D - right.");

        window.addEventListener("keypress", gameControl.input, false);
        game.tick();
    },
    changeDirectionWASD: function (facing) {
        snake.facing = facing;
        game.changeDirection = true;
    },
    restartGame: function () {
        game.tickNumber =  0;
        game.timer = null;
        game.score = 0;
        game.fruit = [
            {x: 9, y: 2}
        ];
        snake.parts = [
            {x: 4, y: 2},
            {x: 3, y: 2},
            {x: 2, y: 2}
        ];
        snake.facing = "E";
        graphics.countDraw = 0;
        game.minutes = 0;
        game.seconds = 0;
    }
};

gameControl.startGame();