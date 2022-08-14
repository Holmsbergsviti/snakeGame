//      #####     ######    ######    ##    #    ######    #   #    ######
//      #    #    #    #    #         ##    #    #    #    #  #     #
//      #    #    ######    ######    #  #  #    ######    ##       ######
//      #    #    #    #         #    #   # #    #    #    #  #     #
//      #####     #    #    ######    #    ##    #    #    #   #    ######

let game = {
    cheat: false,
    gameOver: false,
    pauseTimes: 0,
    fruitIsEaten: 0,
    tickSpeedUp: 1,
    tickTime: 225,
    startGame: 0,
    newFacing: 0,
    timer: null,
    tickNumber: 0,
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
                let sound = new Audio("sound/soundDuckQuack.mp3");
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
        {x: 4, y: 10, facingParts: "E"},
        {x: 3, y: 10, facingParts: "E"},
        {x: 2, y: 10, facingParts: "E"}
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
            document.getElementById("scoreAndRecord").innerHTML =
                "Score: " + game.score + " " +
                "Record: " + game.record;
            if (game.score % 10 === 0) {
                if (game.tickTime !== 100) {
                    game.level++;
                    if (!game.cheat) {
                        document.getElementById("level" + game.level).style.display = "block";
                    } else {
                        document.getElementById("level" + game.level).style.display = "none";
                    }
                    game.tickSpeedUp++;
                    game.tickTime -= 25;
                }
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
                    ctx.fillStyle = "#0077b6";
                    if ((currentY === 0 && currentX === 0) || (currentY === 0 && currentX === 490)
                    || (currentY === 410 && currentX === 0) || (currentY === 410 && currentX === 480)) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize - 10, graphics.squareSize - 10);
                        currentX += graphics.squareSize - 10;
                    } else if (currentY === 0 || currentY === 410) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize, graphics.squareSize - 10);
                        currentX += graphics.squareSize;
                    } else if (currentX === 0 || currentX === 490) {
                        ctx.fillRect(currentX, currentY, graphics.squareSize - 10, graphics.squareSize);
                        currentX += graphics.squareSize - 10;
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
                currentY += graphics.squareSize - 10;
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
            let partXLocation = part.x * graphics.squareSize - 10;
            let partYLocation = part.y * graphics.squareSize - 10;
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
                        ctx.beginPath();
                        ctx.moveTo(partXLocation + 20, partYLocation + 2);
                        ctx.lineTo(partXLocation + 15, partYLocation + 3);
                        ctx.lineTo(partXLocation + 10 , partYLocation + 5);
                        ctx.lineTo(partXLocation + 5, partYLocation + 10);
                        ctx.lineTo(partXLocation + 3, partYLocation + 15);
                        ctx.lineTo(partXLocation + 2, partYLocation + 20);
                        ctx.lineTo(partXLocation + 18, partYLocation + 20);
                        ctx.lineTo(partXLocation + 18, partYLocation + 18);
                        ctx.lineTo(partXLocation + 17, partYLocation + 17);
                        ctx.lineTo(partXLocation + 20, partYLocation + 18);
                        ctx.lineTo(partXLocation + 20, partYLocation + 2);
                        ctx.closePath();
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
        graphics.draw(ctx, game.fruit, "duck");
        graphics.draw(ctx, snake.parts, "snake");
    }
};

let gameControl = {
    rightShiftIsPressed: false,
    gameIsStarted: false,
    changeNickname: false,
    level: game.board,
    newFacing: [],
    changeFacingStart: function () {
        if (gameControl.gameIsStarted === false) {
            gameControl.gameIsStarted = true;
            clearTimeout(loopTimer);
            document.getElementById("pressArrowsToStart").innerHTML = "Eat as many apples as you can";
            document.getElementById("level" + game.level).style.display = "block";
            game.addRandomFruit();
            game.tick();
        }
    },
    keyPress: function (keyCode){
        let key = keyCode.keyCode;

        if (key === 220 && gameControl.rightShiftIsPressed === true) {
            game.score += 5;
            game.fruitIsEaten += 5;
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

        if (key === 73) infoButton();

        if (key === 67) controlButton();
    }
    ,
    gameOver: function () {
        let sound = new Audio("sound/soundGameOver.wav");
        sound.play().then();
        document.getElementById("level" + game.level).style.display = "none";
        document.getElementById("gameOverText").style.display = "block";
        game.gameOver = true;
    },
    processInput: function (key) {
        if (key === "w") if (snake.facing !== "S" && snake.facing !== "N") snake.facing = "N";
        if (key === "a") if (snake.facing !== "E" && snake.facing !== "W") snake.facing = "W";
        if (key === "s") if (snake.facing !== "N" && snake.facing !== "S") snake.facing = "S";
        if (key === "d") if (snake.facing !== "W" && snake.facing !== "E") snake.facing = "E";
    },
    startGame: function () {
        graphics.drawGame();
        document.getElementById("scoreAndRecord").innerHTML =
            "Score: " + game.score + " " +
            "Record: " + game.record;
        window.addEventListener("keydown", gameControl.keyPress);
    },
    restartGame: function () {
        window.clearTimeout(game.timer);
        clearTimeout(loopTimer);

        myText = "Press ↑ ← ↓ → to start        "
        myArray = myText.split("");
        letter = 0;

        game.cheat = false;
        game.gameOver = false;
        game.fruitIsEaten = 0;
        game.tickSpeedUp = 1;
        game.tickTime = 200;
        game.timer = null;
        game.tickNumber =  1;
        game.score = 0;
        game.level = 1;
        game.fruit = [];

        snake.parts = [
            {x: 4, y: 10, facingParts: "E"},
            {x: 3, y: 10, facingParts: "E"},
            {x: 2, y: 10, facingParts: "E"}
        ];
        snake.facing = "E";

        graphics.canvas = document.getElementById("canvas");
        graphics.squareSize = 20;
        graphics.greenOrDarkgreen = 0;
        graphics.countDraw = 0;

        gameControl.level = game.board;
        gameControl.gameIsStarted = false;

        document.getElementById("scoreAndRecord").innerHTML =
            "Score: " + game.score + " " +
            "Record: " + game.record;
        document.getElementById("gameOverText").style.display = "none";

        frameLooper();
        gameControl.startGame();
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

function infoButton() {
    document.getElementById("controlText").style.display = "none";

    let targetDiv = document.getElementById("infoText");
    if (targetDiv.style.display !== "none") {
        targetDiv.style.display = "none";
        targetDiv.style.alignItems = "center";
    } else {
        targetDiv.style.display = "block";
        targetDiv.style.alignItems = "center";
    }
}

function controlButton() {
    document.getElementById("infoText").style.display = "none";

    let targetDiv = document.getElementById("controlText");
    if (targetDiv.style.display !== "none") {
        targetDiv.style.display = "none";
        targetDiv.style.alignItems = "center";
    } else {
        targetDiv.style.display = "block";
        targetDiv.style.alignItems = "center";
    }
}

frameLooper();
gameControl.startGame();