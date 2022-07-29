//      #    #    ######    ##    #    ######    #   #    ######
//      #    #    #         ##    #    #    #    #  #     #
//      #    #    ######    #  #  #    ######    ##       ######
//       #  #          #    #   # #    #    #    #  #     #
//        ##      ######    #    ##    #    #    #   #    ######

let game = {
    gameOver: false,
    pauseTimes: 0,
    fruitIsEaten: 0,
    tickSpeedUp: 1,
    tickTime: 200,
    tickSecond: 5,
    startGame: 0,
    newFacing: 0,
    timer: null,
    tickNumber: 0,
    minutes: 0,
    seconds: 0,
    score: 0,
    record : 0,
    level: 1,
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
    fruit: [],
    tick: function () {
        window.clearTimeout(game.timer);
        if (game.tickSpeedUp >= 1) {
            game.tickSpeedUp++;
            if (game.tickSpeedUp === 15){
                game.tickSpeedUp = 0;
                document.getElementById("level" + game.level).style.display = "none";
            }
        }
        game.tickNumber++;
        if (game.tickNumber % game.tickSecond === 0) gameControl.gameTime();
        let result = snake.move();
        if (result === "Game Over") {
            gameControl.gameOver();
            return;
        }
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", game.tickTime);
    },
    addRandomFruit: function () {
        let randomY = Math.floor(Math.random() * gameControl.level.length);
        let randomX = Math.floor(Math.random() * gameControl.level[randomY].length);
        let randomLocation = {x: randomX, y: randomY};
        if (game.isEmpty(randomLocation) && !game.isSnake(randomLocation)) {
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
                let sound = new Audio("sound/soundAppleCrunch.wav");
                sound.play().then();
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
            if (game.fruitIsEaten === 0){
                snake.parts.pop();
            } else {
                game.fruitIsEaten--;
            }
        }
        if (game.isFruit(location)) {
            game.fruitIsEaten++;
            game.score++;
            if (game.score > game.record) {
                game.record = game.score;
            }
            document.getElementById("scoreAndRecord").innerHTML =
                "Score: " + game.score + " " +
                "Record: " + game.record;
            if (game.score / 15 === 1) {
                game.level++;
                document.getElementById("level2").style.display = "block";
                game.tickSpeedUp++;
                game.tickTime = 125;
                game.tickSecond = 8;
            } else if (game.score / 15 === 2) {
                game.level++;
                document.getElementById("level3").style.display = "block";
                game.tickSpeedUp++;
                game.tickTime = 100;
                game.tickSecond = 10;
            }
        }
    }
};

let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: 20,
    greenOrDarkgreen: 0,
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
                    if (graphics.greenOrDarkgreen % 2 === 0) {
                        ctx.fillStyle = "green";
                        graphics.greenOrDarkgreen++;
                    } else {
                        ctx.fillStyle = "darkgreen";
                        graphics.greenOrDarkgreen++;
                    }
                    ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize);
                }
                currentX += graphics.squareSize;
            });
            currentY += graphics.squareSize;
            currentX = 0;
            graphics.greenOrDarkgreen++;
        });
        graphics.greenOrDarkgreen = 0;
    },
    countDraw: 0,
    draw: function (ctx, source, color) {
        source.forEach(function (part) {
            graphics.countDraw++;
            let partXLocation = part.x * graphics.squareSize;
            let partYLocation = part.y * graphics.squareSize;
            if (color === "red") {
                let img = new Image();
                img.src = "img/imgApple.png";
                ctx.drawImage(img, partXLocation, partYLocation, graphics.squareSize + 3, graphics.squareSize + 3);
            } else {
                if (graphics.countDraw === 1 && color === "blue") {
                    ctx.fillStyle = "white";
                    ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
                    /*
                    if (snake.facing === "N") {
                        let img = new Image();
                        img.src = "img/imgSnakeHeadUp.png";
                        img.id = "imageHead";
                        ctx.drawImage(img, partXLocation, partYLocation, graphics.squareSize + 3, graphics.squareSize + 3)
                    }
                    if (snake.facing === "W") {
                        let img = new Image();
                        img.src = "img/imgSnakeHeadLeft.png";
                        ctx.drawImage(img, partXLocation, partYLocation, graphics.squareSize + 3, graphics.squareSize + 3)
                    }
                    if (snake.facing === "S") {
                        let img = new Image();
                        img.src = "img/imgSnakeHeadDown.png";
                        ctx.drawImage(img, partXLocation, partYLocation, graphics.squareSize + 3, graphics.squareSize + 3)
                    }
                    if (snake.facing === "E") {
                        let img = new Image();
                        img.src = "img/imgSnakeHeadRight.png";
                        ctx.drawImage(img, partXLocation, partYLocation, graphics.squareSize + 3, graphics.squareSize + 3)
                    }
                    */
                } else {
                    ctx.fillStyle = color;
                    ctx.fillRect(partXLocation, partYLocation, graphics.squareSize, graphics.squareSize);
                }
            }
        })
        graphics.countDraw = 0;
    },

    drawGame: function () {
        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.fruit, "red");
        graphics.draw(ctx, snake.parts, "blue");
    }
};

let gameControl = {
    gameIsStarted: false,
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
        if (gameControl.gameIsStarted === false) {
            gameControl.gameIsStarted = true;
            clearTimeout(loopTimer);
            document.getElementById("pressArrowsToStart").innerHTML = "Eat as many apples as you can";
            document.getElementById("level1").style.display = "block";
            game.addRandomFruit();
            game.tick();
        }
    },
    changeFacing: function (keyCode){
        let key = keyCode.keyCode;

        if (key === 38 || key === 87) {
            gameControl.newFacing = gameControl.newFacing + "w";
            gameControl.changeFacingStart();
        }

        if (key === 37 || key === 65) {
            gameControl.newFacing = gameControl.newFacing + "a";
            gameControl.changeFacingStart();
        }

        if (key === 40 || key === 83) {
            gameControl.newFacing = gameControl.newFacing + "s";
            gameControl.changeFacingStart();
        }

        if (key === 39 || key === 68) {
            gameControl.newFacing = gameControl.newFacing + "d";
            gameControl.changeFacingStart();
        }

        if (key === 75) {
            if (game.pauseTimes % 2 === 0) {
                window.clearTimeout(game.timer);
                document.getElementById("pressArrowsToStart").innerHTML = "Game is paused";
            } else {
                document.getElementById("pressArrowsToStart").innerHTML = "Game is continued. " +
                    "Eat as many apples as you can";
                game.tick();
            }
            game.pauseTimes++;
        }

        if (key === 8 || key === 27) {
            if (game.gameOver === false) {
                gameControl.gameOver();
                window.clearTimeout(game.timer);
            }
        }

        if (key === 13) {
            gameControl.restartGame();
        }
    },
    gameOver: function () {
        let sound = new Audio("sound/soundGameOver.wav");
        sound.play().then();
        document.getElementById("level").style.display = "none";
        document.getElementById("gameOver").style.display = "block";
        document.getElementById("pressArrowsToStart").innerHTML = "Game is ended";
        game.gameOver = true;
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
        document.getElementById("scoreAndRecord").innerHTML =
            "Score: " + game.score + " " +
            "Record: " + game.record;
        window.addEventListener("keydown", gameControl.changeFacing, false);
    },
    changeDirectionWASD: function (facing) {
        snake.facing = facing;
    },
    restartGame: function () {
        window.clearTimeout(game.timer);
        clearTimeout(loopTimer);

        myText = "Press ↑ ← ↓ → to start        "
        myArray = myText.split("");
        letter = 0;

        game.gameOver = false;
        game.fruitIsEaten = 0;
        game.tickSpeedUp = 1;
        game.tickTime = 200;
        game.tickSecond = 5;
        game.timer = null;
        game.tickNumber =  1;
        game.minutes = 0;
        game.seconds = 0;
        game.score = 0;
        game.level = 1;
        game.fruit = [];

        snake.parts = [
            {x: 4, y: 10},
            {x: 3, y: 10},
            {x: 2, y: 10}
        ];
        snake.facing = "E";

        graphics.canvas = document.getElementById("canvas");
        graphics.squareSize = 20;
        graphics.greenOrDarkgreen = 0;
        graphics.countDraw = 0;

        gameControl.level = game.board;
        gameControl.gameIsStarted = false;

        document.getElementById("timer").innerHTML = "Time: 0" + game.minutes + ":0" + game.seconds;
        document.getElementById("scoreAndRecord").innerHTML =
            "Score: " + game.score + " " +
            "Record: " + game.record;
        document.getElementById("gameOver").style.display = "none";

        frameLooper();
        gameControl.startGame();
    },
    controlInfoButtons: function (textId) {
        if (textId === "infoText") {
            document.getElementById("controlText").style.display = "none";
        } else {
            document.getElementById("infoText").style.display = "none";
        }

        let targetDiv = document.getElementById(textId);
        if (targetDiv.style.display !== "none") {
            targetDiv.style.display = "none";
            targetDiv.style.alignItems = "center";
        } else {
            targetDiv.style.display = "block";
            targetDiv.style.alignItems = "center";
        }
    }
};

let myText = "Press ↑ ← ↓ → to start        ";
let myArray = myText.split("");
let loopTimer;
let letter = 0;

function frameLooper() {
    if (myArray.length > letter){
        if (letter === 0) {
            document.getElementById("pressArrowsToStart").innerHTML = "";
        }
        document.getElementById("pressArrowsToStart").innerHTML += myArray[letter];
        letter++;
    } else {
        document.getElementById("pressArrowsToStart").innerHTML = "Press ↑ ↓ → ← to start";
        letter = 0;
    }
    loopTimer = setTimeout('frameLooper()',150) ;
}


frameLooper();
gameControl.startGame();