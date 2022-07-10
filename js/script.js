const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let currentYoffset = 0;
let squareSize = 30;
const board = [
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
];

board.forEach(function chekLine(line) {
    line = line.split('');
    let currentXoffset = 0;
    line.forEach(function chekCharacters(character) {
        if (character === '#') {
            ctx.fillStyle = "black";
            ctx.fillRect(currentXoffset, currentYoffset, squareSize, squareSize);
        }
    currentXoffset += squareSize;
    });
    currentYoffset += squareSize;
});