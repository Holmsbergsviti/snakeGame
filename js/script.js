//      #####     ######    ######    ##    #    ######    #   #    ######
//      #    #    #    #    #         ##    #    #    #    #  #     #
//      #    #    ######    ######    #  #  #    ######    ##       ######
//      #    #    #    #         #    #   # #    #    #    #  #     #
//      #####     #    #    ######    #    ##    #    #    #   #    ######

let screenDivisor;
let fontSize;
if (window.innerWidth < 1300) {
    screenDivisor = 1.1;
} else {
    screenDivisor = 2.3;
}

let canvasWidth = (window.innerWidth - (window.innerWidth % screenDivisor)) / screenDivisor;
let squareSize = (canvasWidth - canvasWidth % 25) / 25;
let canvasHeight = squareSize * 21;
canvasWidth = squareSize * 25;

if (squareSize % 2 === 1) {
    squareSize += 1;
    canvasWidth = squareSize * 25;
    canvasHeight = squareSize * 21;
}
if (squareSize < 16) {
    squareSize = 16;
    canvasWidth = squareSize * 25;
    canvasHeight = squareSize * 21;
}

let canvas = document.getElementById("canvas");
canvas.width = canvasWidth.toString();
canvas.height = canvasHeight.toString();

let score = document.getElementById("scoreImg");
score.width = (squareSize * 2).toString();
score.height = (squareSize * 2).toString();

let record = document.getElementById("recordImg");
record.width = (squareSize * 2).toString();
record.height = (squareSize * 2).toString();

fontSize = squareSize * 3;

let game = {
    gameOver: false,
    pauseTimes: 0,
    fruitIsEaten: 0,
    tickSpeedUp: 0,
    tickTime: 225,
    startGame: 0,
    newFacing: 0,
    timer: null,
    tickNumber: 0,
    score: 0,
    record : 0,
    level: 0,
    levels: ["Easy", "Medium", "Hard", "Hardcore", "Professional", "Impossible", "Game Over"],
    showLevel: false,
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
    duck: [
        {x: 13, y: 11}
    ],
    tick: function () {
        window.clearTimeout(game.timer);
        if (game.showLevel) {
            game.tickSpeedUp++;
            if (game.tickSpeedUp === 15){
                game.tickSpeedUp = 0;
                game.showLevel = false;
            }
        }
        game.tickNumber++;
        let result = snake.move();
        if (result === "Game Over") {
            gameControl.gameOver();
            return;
        }
        graphics.drawGame();
        game.timer = window.setTimeout("game.tick()", game.tickTime);
    },
    addRandomFruit: function () {
        let randomY = Math.floor(Math.random() * gameControl.levelBoard.length);
        let randomX = Math.floor(Math.random() * gameControl.levelBoard[randomY].length);
        let randomLocation = {x: randomX, y: randomY};
        if (game.isEmpty(randomLocation) && !game.isSnake(randomLocation)) {
            game.duck.push(randomLocation)
        } else {
            game.addRandomFruit();
        }
    },
    isEmpty: function (location) {
        return gameControl.levelBoard[location.y][location.x] === ' ';
    },
    isWall: function (location) {
        return gameControl.levelBoard[location.y][location.x] === '#';
    },
    isFruit: function (location) {
        for (let fruitNumber = 0; fruitNumber < game.duck.length; fruitNumber++) {
            let fruit = game.duck[fruitNumber];
            if (location.x === fruit.x && location.y === fruit.y) {
                let sound = new Audio("sound/soundDuckQuack.mp3");
                sound.play().then();
                game.duck.splice(fruitNumber, 1);
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
                game.duck.splice(snakePart, 1);
                return true;
            }
        }
        return false;
    }
};

let snake = {
    parts: [
        {x: 4, y: 11, facingParts: "E"},
        {x: 3, y: 11, facingParts: "E"},
        {x: 2, y: 11, facingParts: "E"}
    ],
    facing: "E",
    nextLocation: function () {
        let targetX = snake.parts[0].x;
        let targetY = snake.parts[0].y;
        let facingParts = snake.parts[0].facingParts;
        if (snake.facing === "N") {
            targetY--;
            facingParts = "N";
        }
        if (snake.facing === "S") {
            targetY++;
            facingParts = "S";
        }
        if (snake.facing === "W") {
            targetX--;
            facingParts = "W";
        }
        if (snake.facing === "E") {
            targetX++;
            facingParts = "E";
        }
        return {x: targetX, y:targetY, facingParts: facingParts};
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
            document.getElementById("scoreText").innerHTML = game.score;
            document.getElementById("recordText").innerHTML = game.record;
            if (game.score % 10 === 0) {
                if (game.tickTime !== 100) {
                    game.level++;
                    game.showLevel = true;
                    game.tickSpeedUp++;
                    game.tickTime -= 25;
                }
            }
        }
    }
};

let graphics = {
    canvas: document.getElementById("canvas"),
    squareSize: squareSize,
    greenOrDarkgreen: 0,
    drawBoard: function (ctx) {
        let currentY = 0;
        gameControl.levelBoard.forEach(function chekLine(line) {
            line = line.split('');
            let currentX = 0;
            line.forEach(function chekCharacter(character) {
                if (character === '#') {
                    ctx.fillStyle = "#0077b6";
                    if ((currentY === 0 && currentX === 0) ||
                        (currentY === 0 && currentX === canvasWidth - graphics.squareSize / 2)
                    || (currentY === canvasHeight - graphics.squareSize / 2 && currentX === 0) ||
                        (currentY === canvasHeight - graphics.squareSize / 2 &&
                            currentX === canvasWidth - graphics.squareSize / 2)) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize / 2, graphics.squareSize / 2);
                        currentX += graphics.squareSize / 2;
                    } else if (currentY === 0 || currentY === canvasHeight - graphics.squareSize / 2) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize / 2);
                        currentX += graphics.squareSize;
                    } else if (currentX === 0 || currentX === canvasWidth - graphics.squareSize / 2) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize / 2, graphics.squareSize);
                        currentX += graphics.squareSize / 2;
                    }
                } else {
                    if (graphics.greenOrDarkgreen % 2 === 0) {
                        ctx.fillStyle = "#0077b6";
                    } else {
                        ctx.fillStyle = "#0096c7";
                    }
                    graphics.greenOrDarkgreen++;
                    ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize);
                    currentX += graphics.squareSize;
                }
            });
            if (currentY === 0) {
                currentY += graphics.squareSize / 2;
            } else {
                currentY += graphics.squareSize;
            }
            currentX = 0;
            graphics.greenOrDarkgreen++;
        });
        graphics.greenOrDarkgreen = 0;
    },
    countDraw: 0,
    draw: function (ctx, source, object) {
        source.forEach(function (part) {
            let partXLocation = part.x * graphics.squareSize - (graphics.squareSize / 2);
            let partYLocation = part.y * graphics.squareSize - (graphics.squareSize / 2);
            if (object === "duck") {
                let img = new Image();
                img.src = "img/imgDuck.png";
                ctx.drawImage(img, partXLocation - (graphics.squareSize / 4), partYLocation - (graphics.squareSize / 4),
                    graphics.squareSize + (graphics.squareSize / 20) * 6,
                    graphics.squareSize + (graphics.squareSize / 20) * 6);
            } else {
                if (graphics.countDraw === 0) {
                    if (snake.facing === "N") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 4));
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 4));
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 7));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 5));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 13));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 7));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 5));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 13));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 16) * 15));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 5));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 7));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 13));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + ((graphics.squareSize / 16) * 15));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + ((graphics.squareSize / 8) * 5));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 7));
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();
                    }

                    if (snake.facing === "W") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 16) * 7),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 5),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 13),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 7),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 8) * 5),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 13),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 15),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 5),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 16) * 7),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 13),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 15),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 5),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 7),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();
                    }

                    if (snake.facing === "S") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation, partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 9));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 9));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 4),
                            partYLocation + ((graphics.squareSize / 16) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + (graphics.squareSize / 16));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + ((graphics.squareSize / 8) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 9));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + (graphics.squareSize / 16));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + ((graphics.squareSize / 8) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 5),
                            partYLocation + ((graphics.squareSize / 16) * 9));
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2), partYLocation);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3), partYLocation);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 5) * 2),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();
                    }
                    if (snake.facing === "E") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3), partYLocation);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3), partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 16) * 9),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        //
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 9),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 8) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 16),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 16) * 9),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 3),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 16),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 8) * 3),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 16) * 9),
                            partYLocation + (graphics.squareSize / 5));
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation, partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.lineTo(partXLocation, partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 5) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 5) * 2));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();
                    }
                } else if (graphics.countDraw + 1 === snake.parts.length) {
                    if (snake.parts[snake.parts.length - 1].facingParts !==
                        snake.parts[snake.parts.length - 2].facingParts) {
                        snake.parts[snake.parts.length - 1].facingParts =
                            snake.parts[snake.parts.length - 2].facingParts;
                    }

                    if (snake.parts[snake.parts.length - 1].facingParts === "N") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();
                        }
                    }
                    if (snake.parts[snake.parts.length - 1].facingParts === "W") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize  /2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        }
                    }
                    if (snake.parts[snake.parts.length - 1].facingParts === "S") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();
                        }
                    }
                    if (snake.parts[snake.parts.length - 1].facingParts === "E") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize  /2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize  /2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation,partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation,partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        }
                    }
                } else if (snake.parts[graphics.countDraw].facingParts !==
                     snake.parts[graphics.countDraw - 1].facingParts) {

                    let facing = snake.parts[graphics.countDraw - 1].facingParts +
                        snake.parts[graphics.countDraw].facingParts;

                    if (facing === "NE" || facing === "WS") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        }
                    }
                    if (facing === "NW" || facing === "ES") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        }
                    }

                    if (facing === "SE" || facing === "WN") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation,partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation,partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        }
                    }

                    if (facing === "SW" || facing === "EN") {
                        if (graphics.countDraw % 2 === 0) {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#2BC6BF";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + (graphics.squareSize / 4));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#FFDE55";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#70529F";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.closePath();

                            ctx.fillStyle = "#F0503C";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                                partYLocation + ((graphics.squareSize / 4) * 3));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#53CFF8";
                            ctx.fill();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                            ctx.closePath();

                            ctx.fillStyle = "#FFB133";
                            ctx.fill();

                            ctx.beginPath();
                            ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                                partYLocation + (graphics.squareSize / 2));
                            ctx.lineTo(partXLocation + graphics.squareSize,
                                partYLocation + graphics.squareSize);
                            ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                            ctx.closePath();

                            ctx.fillStyle = "#284086";
                            ctx.fill();
                        }
                    }
                } else {
                    let facing = snake.parts[graphics.countDraw].facingParts;
                    if (graphics.countDraw % 2 === 0) {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize  /2));
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#53CFF8";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation,
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();
                    } else if (facing === "N" || facing === "S") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation, partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                        ctx.lineTo(partXLocation + graphics.squareSize,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#53CFF8";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2), partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();
                    } else if (facing === "W" || facing === "E") {
                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.lineTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#284086";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + graphics.squareSize, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#FFB133";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation, partYLocation);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation, partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation, partYLocation);
                        ctx.closePath();

                        ctx.fillStyle = "#2BC6BF";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + (graphics.squareSize / 4));
                        ctx.closePath();

                        ctx.fillStyle = "#FFDE55";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation,
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation,
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#53CFF8";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + graphics.squareSize,
                            partYLocation + graphics.squareSize);
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + graphics.squareSize);
                        ctx.closePath();

                        ctx.fillStyle = "#70529F";
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.lineTo(partXLocation + ((graphics.squareSize / 4) * 3),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 4),
                            partYLocation + ((graphics.squareSize / 4) * 3));
                        ctx.lineTo(partXLocation + (graphics.squareSize / 2),
                            partYLocation + (graphics.squareSize / 2));
                        ctx.closePath();

                        ctx.fillStyle = "#F0503C";
                        ctx.fill();
                    }
                }
            }
            graphics.countDraw++;
        })
        graphics.countDraw = 0;
    },

    drawGame: function () {
        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.duck, "duck");
        graphics.draw(ctx, snake.parts, "snake");
        if (game.showLevel) {
            ctx.font = fontSize + "px Futura";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(game.levels[game.level],canvasWidth / 2, canvasHeight / 3);
        }
    }
};

let gameControl = {
    rightShiftIsPressed: false,
    gameIsStarted: false,
    changeNickname: false,
    levelBoard: game.board,
    newFacing: [],
    changeFacingStart: function () {
        if (gameControl.gameIsStarted === false) {
            gameControl.gameIsStarted = true;
            game.showLevel = true;
            gameControl.newFacing = [];
            game.newFacing = 0;

            game.tick();
        }
    },
    keyPress: function (keyCode){
        let key = keyCode.keyCode;

        if (key === 220 && gameControl.rightShiftIsPressed === true) {
            game.fruitIsEaten += 15;
            game.score += 15;
            if (game.score > game.record) {
                game.record = game.score;
            }

            document.getElementById("scoreText").innerHTML = game.score;
            document.getElementById("recordText").innerHTML = game.record;
            game.tickSpeedUp++;
        }

        gameControl.rightShiftIsPressed = key === 16;

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

        if ((key === 8 || key === 27) && game.gameOver === false && gameControl.gameIsStarted === true) {
            gameControl.gameOver();
            window.clearTimeout(game.timer);
        }

        if (key === 13 && gameControl.gameIsStarted === true) {
            gameControl.restartGame();
        }
    },
    gameOver: function () {
        let sound = new Audio("sound/soundGameOver.wav");
        sound.play().then();
        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.duck, "duck");
        graphics.draw(ctx, snake.parts, "snake");

        ctx.font = fontSize + "px Futura";
        ctx.fillStyle = "black";
        game.level = 6;
        ctx.fillText(game.levels[game.level], canvasWidth / 2, canvasHeight / 3)
        game.gameOver = true;
    },
    processInput: function (key) {
        if ((gameControl.newFacing.length - game.newFacing) < 6) {
            if (key === "w") if (snake.facing !== "S" && snake.facing !== "N") snake.facing = "N";
            if (key === "a") if (snake.facing !== "E" && snake.facing !== "W") snake.facing = "W";
            if (key === "s") if (snake.facing !== "N" && snake.facing !== "S") snake.facing = "S";
            if (key === "d") if (snake.facing !== "W" && snake.facing !== "E") snake.facing = "E";
        }
    },
    startGame: function () {
        graphics.drawGame();
        document.getElementById("scoreText").innerHTML = game.score;
        document.getElementById("recordText").innerHTML = game.record;

        let ctx = graphics.canvas.getContext("2d");
        ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
        graphics.drawBoard(ctx);
        graphics.draw(ctx, game.duck, "duck");
        graphics.draw(ctx, snake.parts, "snake");

        let locationX = squareSize * 9;
        let locationY = squareSize;

        ctx.fillStyle   = "rgba(0,0,0,0.4)";
        ctx.strokeStyle = "white";

        ctx.fillRect(locationX - squareSize, locationY + squareSize / 2,
            squareSize * 8, squareSize * 8);
        ctx.strokeRect(locationX - squareSize, locationY + squareSize / 2,
            squareSize * 8, squareSize * 8);

        ctx.fillStyle   = "rgba(0,0,0,0.4)";
        ctx.strokeStyle = "white";

        ctx.fillRect(locationX + squareSize * 2, locationY + squareSize * 2,
            squareSize * 2, squareSize * 2);
        ctx.strokeRect(locationX + squareSize * 2, locationY + squareSize * 2,
            squareSize * 2, squareSize * 2);
        ctx.fillRect(locationX + squareSize * 2, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);
        ctx.strokeRect(locationX + squareSize * 2, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);
        ctx.fillRect(locationX + squareSize * -0.5, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);
        ctx.strokeRect(locationX + squareSize * -0.5, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);
        ctx.fillRect(locationX + squareSize * 4.5, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);
        ctx.strokeRect(locationX + squareSize * 4.5, locationY + squareSize * 5,
            squareSize * 2, squareSize * 2);

        ctx.fillStyle   = "white";
        ctx.strokeStyle = "white";

        ctx.beginPath();
        ctx.moveTo(locationX + squareSize * 2.5, locationY + squareSize * 3.5);
        ctx.lineTo(locationX + squareSize * 3, locationY + squareSize * 2.5);
        ctx.lineTo(locationX + squareSize * 3.5, locationY + squareSize * 3.5);
        ctx.lineTo(locationX + squareSize * 2.5, locationY + squareSize * 3.5);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(locationX + squareSize * 2.5, locationY + squareSize * 5.5);
        ctx.lineTo(locationX + squareSize * 3, locationY + squareSize * 6.5);
        ctx.lineTo(locationX + squareSize * 3.5, locationY + squareSize * 5.5);
        ctx.lineTo(locationX + squareSize * 2.5, locationY + squareSize * 5.5);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(locationX + squareSize, locationY + squareSize * 6.5);
        ctx.lineTo(locationX, locationY + squareSize * 6);
        ctx.lineTo(locationX + squareSize, locationY + squareSize * 5.5);
        ctx.lineTo(locationX + squareSize, locationY + squareSize * 6.5);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(locationX + squareSize * 5, locationY + squareSize * 6.5);
        ctx.lineTo(locationX + squareSize * 6, locationY + squareSize * 6);
        ctx.lineTo(locationX + squareSize * 5, locationY + squareSize * 5.5);
        ctx.lineTo(locationX + squareSize * 5, locationY + squareSize * 6.5);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        window.addEventListener("keydown", gameControl.keyPress);

    },
    restartGame: function () {
        window.clearTimeout(game.timer);

        game.gameOver = false;
        game.fruitIsEaten = 0;
        game.tickSpeedUp = 1;
        game.tickTime = 200;
        game.timer = null;
        game.tickNumber =  1;
        game.score = 0;
        game.level = 0;
        game.showLevel = false;
        game.duck = [
            {x: 13, y: 11}
        ];

        snake.parts = [
            {x: 4, y: 11, facingParts: "E"},
            {x: 3, y: 11, facingParts: "E"},
            {x: 2, y: 11, facingParts: "E"}
        ];
        snake.facing = "E";

        graphics.canvas = document.getElementById("canvas");
        graphics.greenOrDarkgreen = 0;
        graphics.countDraw = 0;

        gameControl.levelBoard = game.board;
        gameControl.gameIsStarted = false;

        document.getElementById("scoreText").innerHTML = game.score;
        document.getElementById("recordText").innerHTML = game.record;
        gameControl.startGame();
    }
};

gameControl.startGame();