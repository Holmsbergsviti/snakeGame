let game = {
    newFacing: 0,
    timer: null,
    tickNumber: 0,
    minutes: 0,
    seconds: 0,
    score: 0,
    record : 0,
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
        {x: 14, y: 10}
    ],
    tick: function () {
        window.clearTimeout(game.timer);
        game.tickNumber++;
        if (game.tickNumber % 5 === 0) gameControl.gameTime();
        let result = snake.move();
        if (result === "Game Over") {
            document.getElementById("gameOver").style.display = "block";
            return;
        }
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", 200);
    },
    addRandomFruit: function () {
        let randomY = Math.floor(Math.random() * gameControl.level.length);
        let randomX = Math.floor(Math.random() * gameControl.level[randomY].length);
        let randomLocation = {x: randomX, y: randomY};
        if (game.isEmpty(randomLocation) && !game.isFruit(randomLocation)) {
            game.fruit.push(randomLocation)
        } else {
            game.addRandomFruit();
        }
    },
    isEmpty: function (location) {
        return gameControl.level[location.y][location.x] === ' ';
    },
    isWall: function (location) {
        return gameControl.level[location.y][location.x] === '#';
    },
    isFruit: function (location) {
        for (let fruitNumber = 0; fruitNumber < game.fruit.length; fruitNumber++) {
            let fruit = game.fruit[fruitNumber];
            if (location.x === fruit.x && location.y === fruit.y) {
                game.fruit.splice(fruitNumber, 1);
                game.addRandomFruit();
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
        {x: 4, y: 10},
        {x: 3, y: 10},
        {x: 2, y: 10}
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
            if (game.score > game.record) {
                game.record = game.score;
            }
            document.getElementById("scoreAndRecord").innerHTML =
                "Score: " + game.score + " " +
                "Record: " + game.record;
        }
    }
};

let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 20,
    drawBoard: function (ctx) {
        let currentY = 0;
        gameControl.level.forEach(function chekLine(line) {
            line = line.split('');
            let currentX = 0;
            line.forEach(function chekCharacter(character) {
                if (character === '#') {
                    ctx.fillStyle = "brown";
                    ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize);
                } else {
                    ctx.fillStyle = "green";
                    ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize);
                }
                currentX += graphics.squareSize;
            });
            currentY += graphics.squareSize;
        });
    },
    countDraw: 0,

    draw: function (ctx, source, color) {
        source.forEach(function (part) {
            graphics.countDraw++;
            let partXLocation = part.x * graphics.squareSize;
            let partYLocation = part.y * graphics.squareSize;
            if (graphics.countDraw === 1 && color === "brown") {
                ctx.fillStyle = "beige";
                ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
            } else {
                ctx.fillStyle = color;
                ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
            }
            if (color === "red") {
                let a = new Image();
                a.src = "img/imgApple.png";
                ctx.drawImage(a, partXLocation, partYLocation, graphics.squareSize, graphics.squareSize)
            }
        })
        graphics.countDraw = 0;
    },

    drawGame: function () {
        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.fruit, "red");
        graphics.draw(ctx, snake.parts, "brown");
    }
};

let gameControl = {
    startGameBtn: false,
    level: game.board,
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
    changeFacingStart: function () {
        if (gameControl.startGameBtn === false) {
            gameControl.startGameBtn = true;
            game.tick();
        }
    },
    changeFacing: function (keyPressed) {
        let key = keyPressed.key.toLowerCase();
        if (key === "w" || key === "a" || key === "s" || key || "d") {
            gameControl.newFacing = gameControl.newFacing + key;
        }
        gameControl.changeFacingStart();

    },
    changeFacingArrow: function (keyCode){
        let key = keyCode.keyCode;
        if (key === 38) {
            gameControl.newFacing = gameControl.newFacing + "w";
        }
        if (key === 37) {
            gameControl.newFacing = gameControl.newFacing + "a";
        }
        if (key === 40) {
            gameControl.newFacing = gameControl.newFacing + "s";
        }
        if (key === 39) {
            gameControl.newFacing = gameControl.newFacing + "d";
        }
        gameControl.changeFacingStart();
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
        graphics.drawGame();
        window.addEventListener("keydown", gameControl.changeFacingArrow, false)
        window.addEventListener("keypress", gameControl.changeFacing, false);
    },
    changeDirectionWASD: function (facing) {
        snake.facing = facing;
        game.changeDirection = true;
    },
    restartGame: function () {
        window.clearTimeout(game.timer);
        game.board = [
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
        ];
        game.tickNumber =  0;
        game.timer = null;
        game.score = 0;
        game.minutes = 0;
        game.seconds = 0;
        game.fruit = [
            {x: 14, y: 10}
        ];
        snake.parts = [
            {x: 4, y: 10},
            {x: 3, y: 10},
            {x: 2, y: 10}
        ];
        snake.facing = "E";
        graphics.countDraw = 0;
        gameControl.level = game.board;
        gameControl.startGameBtn = false;
        document.getElementById("scoreAndRecord").innerHTML =
            "Score: " + game.score + " " +
            "Record: " + game.record;
        document.getElementById("timer").innerHTML = "Time: 0" + game.minutes + ":0" + game.seconds;
        document.getElementById("gameOver").style.display = "none";
        gameControl.startGame();
    },
    info: function () {
        let targetDiv = document.getElementById("infoText");
        if (targetDiv.style.display !== "none") {
            targetDiv.style.display = "none";
            targetDiv.style.alignItems = "center";
        } else {
            targetDiv.style.display = "block";
            targetDiv.style.alignItems = "center";
        }
    }
};

gameControl.startGame();